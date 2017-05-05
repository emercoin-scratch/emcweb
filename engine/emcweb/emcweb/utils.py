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
    data = client.getblockchaininfo()
    status = 2

    if data.get('error', False):
        return 0, None, data['error']['message']
    result = data['result']
    if round(result['verificationprogress'], 2) < 0.99 or result['blocks'] + 1 < result['headers']:
        status = 1

    return status, result['blocks'], ''
