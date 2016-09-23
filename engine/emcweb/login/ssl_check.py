# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import hashlib
import re
import base64
import os

from flask import request

from emcapi.client import EMCClient
from emcweb import flask_app


# make client
PARAMS = {
    'host': flask_app.flask_app.config.get('EMC_SERVER_HOST', 'localhost'),
    'port': flask_app.flask_app.config.get('EMC_SERVER_PORT', 80),
    'user': flask_app.flask_app.config.get('EMC_SERVER_USER', 'user'),
    'password': flask_app.flask_app.config.get('EMC_SERVER_PASSWORD', 'qwerty'),
    'protocol': flask_app.flask_app.config.get('EMC_SERVER_PROTO', 'http'),
    'verify': False
}
client = EMCClient(**PARAMS)


def check_ssl():
    char = '0'
    serial = request.environ.get('SSL_CLIENT_M_SERIAL')
    serial = serial.rjust(16, char).lower() if serial else ''.rjust(16, char)

    # Check on the authenticity of the SSL key
    if not all([request.environ.get('SSL_CLIENT_CERT'),
                request.environ.get('SSL_CLIENT_I_DN_UID') == 'EMC',
                serial[0] != '0']):
        return False

    resp = client.name_show('ssl:{0}'.format(serial))

    if resp.get('error'):
        return False
    if resp['result']['expires_in'] <= 0:
        return False

    value = resp['result']['value'].split('=')
    algorithms = hashlib.algorithms_available
    if value[0] not in algorithms:
        return False

    cert = re.sub(r'\-+BEGIN CERTIFICATE\-+|-+END CERTIFICATE\-+|\n|\r', '', request.environ.get('SSL_CLIENT_CERT'))
    if getattr(hashlib, value[0])(base64.b64decode(cert)).hexdigest() != value[1]:
        return False

    if flask_app.flask_app.config.get('EMCSSH_VERIFY_SSL', False):
        # Check the SSL key on access permitions
        with os.popen('{} {}'.format(flask_app.flask_app.config.get('EMCSSH_BIN_PATH', '/usr/sbin/emcssh'),
                                 flask_app.flask_app.config.get('EMCSSH_VERIFY_USER', 'emc'))) as f:
            for line in f:
                if len(line.strip()) == 0:
                    continue
                if line.strip()[0] == '#':
                    continue
                if serial.upper() == line.upper().strip():
                    return True

        return False
    else:
        return True
