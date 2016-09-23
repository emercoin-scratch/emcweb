# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from flask import flash

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


def get_block_status():
    data = client.getinfo()

    if (data.get('error') and data['error']['code'] == -9999) or not data.get('result'):
        return 0, None

    status = 1 if 'Checkpoint is too old' in data['result']['errors'] else 2
    return status, data['result']['blocks']
