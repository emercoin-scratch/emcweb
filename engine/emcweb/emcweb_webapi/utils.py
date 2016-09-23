# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from emcweb.app import flask_app
from emcapi.client import EMCClient


PARAMS = {
    'host': flask_app.flask_app.config.get('EMC_SERVER_HOST', 'localhost'),
    'port': flask_app.flask_app.config.get('EMC_SERVER_PORT', 80),
    'user': flask_app.flask_app.config.get('EMC_SERVER_USER', 'user'),
    'password': flask_app.flask_app.config.get('EMC_SERVER_PASSWORD', 'qwerty'),
    'protocol': flask_app.flask_app.config.get('EMC_SERVER_PROTO', 'http'),
    'verify': False
}

client = EMCClient(**PARAMS)
