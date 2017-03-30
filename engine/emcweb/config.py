import argparse
import binascii
import sys
import os
import types
import re

from Crypto import Random
from hashlib import md5
from getpass import getpass

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.exc import OperationalError, ProgrammingError, IntegrityError

from subprocess import check_call
from shutil import chown, move
from emcapi import EMCClient
from celery import Celery


Base = declarative_base()


class Credentials(Base):
    __tablename__ = 'credentials'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    name = Column(String(255))
    password = Column(String(255))

class Users(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)

class Wallets(Base):
    __tablename__ = 'wallets'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    name = Column(String(255), nullable=False)
    path = Column(String(255), nullable=False)



def get_sql_session(kwargs):
    database_uri = kwargs['SQLALCHEMY_DATABASE_URI']

    engine = create_engine(database_uri)
    session_cls = sessionmaker(bind=engine)
    sess = session_cls()
    sess._model_changes = {}

    return sess

def test_sql_connection(sess):
    error_str = ''
    
    try:
        result = sess.execute('SHOW VARIABLES LIKE "%version%";')
    except:
        return False, 'Database connection refused'
    
    return True, ''


def create_credentials_wallet(sess, wallet_name, wallet_path, kwargs):
    error_str = ''
    username = kwargs['account']['username']
    password = kwargs['account']['password']
    
    try:
        result = sess.execute('select * from alembic_version')
    except OperationalError:
        return False, 'Database connection refused'
    except ProgrammingError:
        return False, 'Database is not configured.'

    strings = [row[0] for row in result]
    if len(strings) < 1:
        error_str = 'Database is not configured'
    
    if error_str:
        return False, error_str

    try:
        result = sess.execute('select * from credentials where name="{}"'.format(username))
    except:
        return False, 'Not found table credentials in database'

    if result and result.rowcount > 0:
        return False, 'EMC WEB user "{}" already exists'.format(username)


    try:
        result = sess.execute('select max(id) AS last_id from users')
    except:
        return False, 'Not found table users in database'
    
    max_id = -1

    for row in result:
        max_id = row[0]
        break

    if max_id < 0:
        new_user = Users(id=1)
        sess.add(new_user)
        try:
            sess.commit()
        except:
            return False, 'Error creating user'
        max_id = 1

    new_credentials = Credentials(user_id = max_id, name=username, password=md5(password.encode()).hexdigest())
    sess.add(new_credentials)
    
    try:
        sess.commit()
    except:
        return False, 'Error creating credentials "{}" already exists'.format(username)
    
    new_wallet = Wallets(user_id=max_id,
                               name=wallet_name,
                               path=wallet_path)
    sess.add(new_wallet)
    try:
        sess.commit()
    except:
        return False, 'Error creating wallet.'

    return True, ''


def test_emc_connection(kwargs):
    emc_client = EMCClient(
                           host=kwargs['EMC_SERVER_HOST'],
                           port=kwargs['EMC_SERVER_PORT'],
                           user=kwargs['EMC_SERVER_USER'],
                           password=kwargs['EMC_SERVER_PASSWORD'],
                           protocol=kwargs['EMC_SERVER_PROTO'],
                           verify=False)
    try:
        info = emc_client.getinfo()
    except:
        return False, 'Connection refused'
        
    if info.get('error', False):
        return False, info['error']['message']
    else:
        return True, ''


def config_flask(kwargs):
    key_pattern = re.compile(r'^#?([\w]+) ?= ?(.+)$')

    ex_file = os.path.join(os.path.dirname(__file__), '..', 'settings', 'flask.py.example')
    flask_file = os.path.join(os.path.dirname(__file__), '..', 'settings', 'flask.py')
    emc_home = ''
    upload_file_path = '/var/lib/emcweb/uploads/Default'
    wallet_name = 'Default'

    if kwargs['account'].get('password', False) and kwargs['account'].get('password2', False):
        if not kwargs['account']['password'] == kwargs['account']['password2']:
            return False, 'Password and confirm password do not match'
    else:
        return False, 'Password and confirm password can not be empty'

    if not os.path.exists(ex_file):
        return False, 'Not exists file "flask.py.example"'

    old_file = open(ex_file, 'r').read().split('\n')
    new_file = []

    kwargs['SECRET_KEY'] = generate_secret_key(32)
    kwargs['WTF_CSRF_SECRET_KEY'] = generate_secret_key(32)

    for line in old_file: 
        match_obj = key_pattern.search(line)
        
        if match_obj and len(match_obj.groups()) == 2:
            if kwargs.get(match_obj.group(1), False):
            
                line = '{0} = {1}'.format(
                        match_obj.group(1),
                        repr(kwargs.get(match_obj.group(1), '')))


        new_file.append(line)

    res, error = test_emc_connection(kwargs)
    if not res:
        return False, 'EMC: {}'.format(error)

    sql_session = get_sql_session(kwargs)
    res, error = test_sql_connection(sql_session)
    if not res:
        return False, 'SQL: {}'.format(error)
    
    try:
        check_call(['touch', '/etc/emercoin/emcssh.keys.d/emcweb'], timeout=300)
        chown('/etc/emercoin/emcssh.keys.d/emcweb', 'emc', 'emc')
    except:
        return False, "Failed creating file for emcssh.keys. {}".format(sys.exc_info())

    try:
        f = open(flask_file, 'w')
        f.write('\n'.join(new_file))
        f.close()
    except:
        return False, 'Error write config file on disk'

    try:
        chmod(flask_file, 0o640)
    except:
        pass

    try:
        check_call(['python3', '/var/lib/emcweb/manage.py', 'db', 'upgrade'], timeout=300)
    except:
        return False, 'Error creating database'
    
    res, error = create_credentials_wallet(sql_session, wallet_name, upload_file_path, kwargs)
    if not res:
        return False, 'Credentials: {}'.format(error)
    
    try:
        check_call(['touch', '/var/lib/emcweb/wsgi.py'], timeout=300)
    except:
        return True, "Failed restart wsgi application. Please restart your web server manualy."

    try:
        #for celery start
        check_call(['touch', '/var/lib/emcweb/.restart-providers'], timeout=300)
    except:
        return True, "Failed restart celery application. Please restart celery manualy."
    
    return True, ''

def generate_secret_key(length):
    result = binascii.hexlify(Random.get_random_bytes(length // 2))

    if result[0] == 48:
        result = b'f' + result[1:]

    return result.decode()


