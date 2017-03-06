# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import importlib
import os
import re

from emcweb.config import config_flask
from flask import Flask, render_template, redirect, url_for, flash, request
from sqlalchemy.exc import DBAPIError, ProgrammingError, OperationalError

from emcweb.exts import connection, migrate, login_manager, celery
from emcweb.utils import apply_db_settings
from celery import Celery


__author__ = 'Aspanta Limited'
__email__ = 'info@aspanta.com'


def create_flask_config(req, kwargs):
    error_msg = 'test'
    args = req.form

    for key, value in kwargs.items():
        if key=='db':
            value['name'] = args['databasename']
            value['host'] = args['databasehost']
            value['port'] = args['databaseport']
            value['username'] = args['databaseusername']
            value['password'] = args['databasepassword']
        elif key == 'account':
            value['username'] = args['username']
            value['password'] = args['password']
            value['password2'] = args['password2']
        elif args.get(key, None):
            kwargs[key] = args[key]
    
    db = kwargs['db']
    kwargs['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://{0}:{1}@{2}:{3}/{4}'.format(
                                                        db['username'],
                                                        db['password'],
                                                        db['host'],
                                                        db['port'],
                                                        db['name'] )
    kwargs['CELERY_RESULT_BACKEND'] = kwargs['BROKER_URL']
    result, error_msg = config_flask(kwargs)

    return result, error_msg


class FlaskApp(object):
    def __init__(self):
        self.flask_app = None
        self.celery = None


    def create_app(self, config=None):
        self.flask_app = Flask(
            'emcweb',
            static_url_path='/static',
            static_folder=os.path.join(os.path.dirname(__file__), '..', 'static')
        )
        
        config_file = os.path.join(os.path.dirname(__file__), '..', 'settings', 'flask.py')
        if not os.path.exists(config_file):
            self.__set_non_config_error()
            return self.flask_app

        self.flask_app.config.from_pyfile(config_file)
        if config:
            self.flask_app.config.from_pyfile(config)

        self.__init_exts()
        self.__init_blueprints()
        self.__set_handlers()

        return self.flask_app

    def __set_non_config_error(self):
        @self.flask_app.errorhandler(404)
        def access_forbidden(e):
            return redirect(url_for('index'))

        @self.flask_app.route('/')
        def index():
            return redirect(url_for('config'))

        @self.flask_app.route('/config', methods=['GET', 'POST'])
        def config():
            config_file = os.path.join(os.path.dirname(__file__), '..', 'settings', 'flask.py')
            if not os.path.exists(config_file):
                default_settings = {
                                    'SQLALCHEMY_DATABASE_URI': '',
                                    'BROKER_URL': 'redis://localhost:6379/0',
                                    'CELERY_RESULT_BACKEND': 'redis://localhost:6379/0',
                                    'EMC_SERVER_HOST': 'localhost',
                                    'EMC_SERVER_PORT': 6662,
                                    'EMC_SERVER_USER': '',
                                    'EMC_SERVER_PASSWORD': '',
                                    'EMC_SERVER_PROTO': 'https',
                                    'db': {
                                           'name': 'emcwebdb',
                                           'host': 'localhost',
                                           'port': 3306,
                                           'username': '',
                                           'password': '',
                                           },
                                    'account':{
                                               'username': '',
                                               'password': '',
                                               'password2': '',
                                            },
                                    }

                if request.method == 'GET':
                    return render_template('config.html', **default_settings)
                else:
                    result, message = create_flask_config(request, default_settings)
                    if result:
                        return render_template('config.html', **{'created': True, 'message': message})
                    else:
                        default_settings['error_msg'] = message
                        return render_template('config.html', **default_settings)


    def __init_exts(self):
        connection.init_app(self.flask_app)
        migrate.init_app(self.flask_app, connection)
        login_manager.init_app(self.flask_app)
        celery.config_from_object(self.flask_app.config)

    def __init_blueprints(self):
        for bp_name in self.flask_app.config['MODULES']:
            module_bp = importlib.import_module('emcweb.%s' % bp_name).module_bp
            self.flask_app.register_blueprint(module_bp)

    def __set_handlers(self):
        @self.flask_app.errorhandler(500)
        def system_error(e):
            return render_template('err_conf.html', message='System is not configured')

        @self.flask_app.errorhandler(403)
        def access_forbidden(e):
            flash('Authentication failed', 'danger')
            return redirect(url_for('emcweb.index'))

        @self.flask_app.errorhandler(401)
        def access_forbidden(e):
            flash('You are not authenticated or your session has expired', 'danger')
            return redirect(url_for('emcweb.index'))

        @self.flask_app.before_first_request
        def set_db_settings():
            try:
                apply_db_settings(self.flask_app)
            except ProgrammingError:
                self.flask_app.config['DB_FALL'] = 1
            except (DBAPIError, OperationalError):
                self.flask_app.config['DB_FALL'] = 2

    def create_celery(self):
        celery_app = Celery(self.flask_app.import_name, broker=self.flask_app.config['BROKER_URL'])
        celery_app.conf.update(self.flask_app.config)
        app = self.flask_app

        # Make context for Celery worker
        TaskBase = celery_app.Task

        class ContextTask(TaskBase):
            abstract = True

            def __call__(self, *args, **kwargs):
                with app.app_context():
                    return TaskBase.__call__(self, *args, **kwargs)

        celery_app.Task = ContextTask

        return celery_app


flask_app = FlaskApp()
