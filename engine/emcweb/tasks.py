# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from shutil import move
from smtplib import SMTP_SSL, SMTP
from subprocess import check_call, check_output, CalledProcessError
from time import sleep
from os import path, unlink, symlink

from .exts import celery
from .app import flask_app
from .utils import apply_db_settings


def check_emercoind_process():
    try:
        check_output(['systemctl', 'status', 'emercoind.service'], universal_newlines=True, timeout=300)
    except CalledProcessError:
        return False

    return True


def start_emercoind():
    try:
        check_call(['systemctl', 'start', 'emercoind.service'], timeout=300)
    except:
        pass

    for i in range(60):
        if check_emercoind_process():
            break
        sleep(1)
    # waiting
    sleep(10)


def stop_emercoind():
    try:
        check_call(['systemctl', 'stop', 'emercoind.service'], timeout=300)
    except:
        pass

    for i in range(60):
        if not check_emercoind_process():
            break
        sleep(1)
    # waiting
    sleep(10)


@celery.task
def change_wallet(filename):
    stop_emercoind()

    unlink(path.join(flask_app.flask_app.config['EMC_HOME'], 'wallet.dat'))
    symlink(path.join(flask_app.flask_app.config['UPLOAD_FOLDER'], filename),
            path.join(flask_app.flask_app.config['EMC_HOME'], 'wallet.dat'))

    start_emercoind()

    return 0


@celery.task
def make_wallet_link_encrypt(filename):
    stop_emercoind()

    unlink(path.join(flask_app.flask_app.config['UPLOAD_FOLDER'], filename))
    move(path.join(flask_app.flask_app.config['EMC_HOME'], 'wallet.dat'),
         path.join(flask_app.flask_app.config['UPLOAD_FOLDER'], filename))
    symlink(path.join(flask_app.flask_app.config['UPLOAD_FOLDER'], filename),
            path.join(flask_app.flask_app.config['EMC_HOME'], 'wallet.dat'))

    start_emercoind()

    return 0


@celery.task
def restart_emercoind():
    stop_emercoind()
    start_emercoind()

    return 0


@celery.task
def sendmail(to_mails, message):
    # Update settings
    apply_db_settings(flask_app.flask_app)

    mail = 'From: {}\nTo: {}\nSubject: {}\n\n{}'.format(
        flask_app.flask_app.config.get('EMAIL_EMAIL_FROM'),
        to_mails,
        flask_app.flask_app.config.get('EMAIL_SUBJECT'),
        message
    ).encode(encoding='utf-8')

    server_str = '{}:{}'.format(flask_app.flask_app.config.get('EMAIL_HOST', '127.0.0.1'),
                                flask_app.flask_app.config.get('EMAIL_PORT', 25))
    server = SMTP_SSL(server_str) if flask_app.flask_app.config.get('EMAIL_ENCRYPTION', 0) == 2 \
        else SMTP(server_str)

    if flask_app.flask_app.config.get('EMAIL_ENCRYPTION', 0) == 1:
        server.starttls()

    if flask_app.flask_app.config.get('EMAIL_AUTH', 0):
        server.login(flask_app.flask_app.config.get('EMAIL_LOGIN'),
                     flask_app.flask_app.config.get('EMAIL_PASSWORD'))
    server.sendmail(flask_app.flask_app.config.get('EMAIL_EMAIL_FROM'),
                    to_mails,
                    mail)
    server.quit()
