# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import os
import time

from flask import current_app
from flask_restful import reqparse
from emcweb.emcweb_webapi.login_resource import LoginResource

from emcweb.emcweb_webapi.utils import client
from emcweb.tasks import make_wallet_link_encrypt
from emcweb.emcweb_webapi.views import api


class EncryptAPI(LoginResource):

    @staticmethod
    def get():
        """
        Get wallet encrypt status
        """
        data = client.getinfo()
        if data.get('error', True):
            return {'result_status': True, 'result': 0}

        if 'unlocked_until' not in data['result']:
            return {'result_status': True, 'result': 0}

        if data['result']['unlocked_until'] == 0:
            return {'result_status': True, 'result': 1}

        data = client.getaddressesbyaccount('')
        if data.get('error', True):
            return {'result_status': True, 'result': 0}
        addr = data['result'][0]

        data = client.dumpprivkey(addr)
        if data.get('error'):
            if data['error']['code'] == -13:
                return {'result_status': True, 'result': 2}

        return {'result_status': True, 'result': 3}

    @staticmethod
    def delete():
        """
        Close wallet
        """
        data = client.walletlock()

        if data.get('error', False):
            return {'result_status': False, 'message': data['error']['message']}, 400

        return {'result_status': True, 'result': 'Locked'}

    @staticmethod
    def post():
        """
        Open wallet
        """
        parser = reqparse.RequestParser()
        parser.add_argument('passphrase', required=True, help='Password')
        parser.add_argument('mintonly', required=False, help='Open for mint only')
        args = parser.parse_args()

        params = [args['passphrase'], current_app.config.get('EMC_OPEN_TIMEOUT', 3000)]
        if args['mintonly']:
            params.append(True)

        data = client.walletpassphrase(*params)

        if data.get('error', False):
            return {'result_status': False, 'message': data['error']['message']}, 400

        return {'result_status': True}

    @staticmethod
    def put():
        parser = reqparse.RequestParser()
        parser.add_argument('pass', required=True, help='Password')
        args = parser.parse_args()

        filename = os.path.basename(os.path.realpath(os.path.join(current_app.config['EMC_HOME'], 'wallet.dat')))
        data = client.encryptwallet(args['pass'])

        if data.get('error', False):
            return {'result_status': False, 'message': data['error']['message']}, 400

        time.sleep(10)
        try:
            result = make_wallet_link_encrypt.delay(filename)
        except Exception:
            return {'result_status': False, 'message': 'Celery transport connection refused'}, 500
        for i in range(60):
            if result.ready():
                time.sleep(10)
                return {'result_status': True}
            time.sleep(1)

        time.sleep(10)

        return {'result_status': True}


api.add_resource(EncryptAPI, '/encrypt')
