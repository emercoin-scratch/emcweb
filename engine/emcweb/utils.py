# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import datetime

from emcweb.models import Settings

CONFIGS_DB = {
    'open_time': {
        'db2html': int,
        'db2flask': int,
        'flask_setting': 'EMC_OPEN_TIMEOUT',
        'default': 7776000
    },
    'lc_api_key': {
        'db2html': str,
        'db2flask': str,
        'flask_setting': 'LIVECOIN_API_KEY',
        'default': None
    },
    'lc_secret_key': {
        'db2html': str,
        'db2flask': str,
        'flask_setting': 'LIVECOIN_SECRET_KEY',
        'default': None
    },
    'smtp_enabled': {
        'db2html': lambda x: bool(int(x)),
        'db2flask': lambda x: bool(int(x)),
        'flask_setting': 'EMAIL_ENABLED',
        'default': False
    },
    'smtp_host': {
        'db2html': str,
        'db2flask': str,
        'flask_setting': 'EMAIL_HOST',
        'default': '127.0.0.1'
    },
    'smtp_port': {
        'db2html': int,
        'db2flask': int,
        'flask_setting': 'EMAIL_PORT',
        'default': 25
    },
    'smtp_connection': {
        'db2html': int,
        'db2flask': int,
        'flask_setting': 'EMAIL_ENCRYPTION',
        'default': 0
    },
    'smtp_email': {
        'db2html': str,
        'db2flask': str,
        'flask_setting': 'EMAIL_EMAIL_FROM',
        'default': 'root@localhost'
    },
    'smtp_auth': {
        'db2html': lambda x: bool(int(x)),
        'db2flask': lambda x: bool(int(x)),
        'flask_setting': 'EMAIL_AUTH',
        'default': False
    },
    'smtp_username': {
        'db2html': str,
        'db2flask': str,
        'flask_setting': 'EMAIL_LOGIN',
        'default': ''
    },
    'smtp_password': {
        'db2html': str,
        'db2flask': str,
        'flask_setting': 'EMAIL_PASSWORD',
        'show': False,
        'default': ''
    },
}


def apply_db_settings(app):
    for setting in Settings.query.all():
        config = CONFIGS_DB.get(setting.option)
        if config:
            app.config[config['flask_setting']] = config['db2flask'](setting.value)
