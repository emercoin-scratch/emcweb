# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from flask import current_app
from flask_restful import reqparse
from emcweb.emcweb_webapi.login_resource import LoginResource

from livecoinapi import LiveCoinClient
from livecoinapi.client import APIError

from emcweb.emcweb_webapi.utils import client
from emcweb.emcweb_webapi.views import api


class LiveCoinAPI(LoginResource):

    @staticmethod
    def get():
        if not current_app.config.get('LIVECOIN_ENABLE', False) or not current_app.config.get('LIVECOIN_API_KEY', ''):
            return {'result_status': False, 'message': 'livecoin disabled or not configured'}

        lc_client = LiveCoinClient(current_app.config.get('LIVECOIN_API_KEY', ''),
                                   current_app.config.get('LIVECOIN_SECRET_KEY', ''))
        try:
            data = lc_client.call('get', '/payment/balances')
        except APIError:
            return {'result_status': False, 'message': 'LiveCoin has not returned balances'}, 400

        return {'result_status': True, 'result': {balance['type']: balance['value']
                                                  for balance in data if balance['currency'] == 'EMC'}}

    @staticmethod
    def post():
        if not current_app.config.get('LIVECOIN_ENABLE', False):
            return {'result_status': False, 'message': 'livecoin disabled'}

        parser = reqparse.RequestParser()
        parser.add_argument('amount', required=True, help='Amount must bu set', type=float)
        args = parser.parse_args()

        lc_client = LiveCoinClient(current_app.config.get('LIVECOIN_API_KEY', ''),
                                   current_app.config.get('LIVECOIN_SECRET_KEY', ''))

        data = None
        for i in range(10):
            try:
                data = lc_client.call('get', '/payment/get/address', {'currency': 'EMC'})
                break
            except APIError:
                return {'result_status': False, 'message': 'Your payment has been declined'}, 400

        if len(data['wallet']) != 34:
            return {'result_status': False, 'message': 'Your payment has been declined'}, 400

        resp = client.sendtoaddress(data['wallet'], args.amount)

        if resp.get('error'):
            return {
                'result_status': False,
                'message': 'Your payment has been declined' if resp['error']['message'] == 'Insufficient funds' else
                resp['error']['message']
            }, 500

        return {'result_status': True, 'result': 'Sent'}

    @staticmethod
    def put():
        if not current_app.config.get('LIVECOIN_ENABLE', False):
            return {'result_status': False, 'message': 'livecoin disabled'}

        parser = reqparse.RequestParser()
        parser.add_argument('amount', required=True, help='Amount must bu set', type=float)
        args = parser.parse_args()

        lc_client = LiveCoinClient(current_app.config.get('LIVECOIN_API_KEY', ''),
                                   current_app.config.get('LIVECOIN_SECRET_KEY', ''))

        data = client.getaddressesbyaccount('')
        if data.get('error', False):
            return {'result_status': False, 'message': data['error']['message']}, 400

        address = data['result'][0]

        try:
            data = lc_client.call('post', '/payment/out/coin', {
                'amount': args['amount'],
                'currency': 'EMC',
                'wallet': address
            })

            if not data['amount']:
                return {'result_status': False, 'message': 'Your payment has been declined'}, 400

            return {'result_status': True, 'result': 'Received'}
        except APIError:
            return {'result_status': False, 'message': 'Your payment has been declined'}, 400


api.add_resource(LiveCoinAPI, '/live_coin')
