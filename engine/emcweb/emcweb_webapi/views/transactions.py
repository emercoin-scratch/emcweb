# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from datetime import datetime

from flask_restful import reqparse
from emcweb.emcweb_webapi.login_resource import LoginResource

from emcweb.emcweb_webapi.utils import client
from emcweb.emcweb_webapi.views import api


class TransactionsAPI(LoginResource):

    @staticmethod
    def get():
        data = client.listtransactions()
        if data.get('error', False):
            return {'result_status': False, 'message': data['error']['message']}, 400

        transactions = data['result'] if data['result'] else []
        for transaction in transactions:
            transaction['sexy_time'] = datetime.fromtimestamp(transaction['time']).strftime('%Y-%m-%d %H:%M:%S')
            if 'address' not in transaction:
                transaction['address'] = 'Network fee'

        return {'result_status': True, 'result': transactions}

    @staticmethod
    def post():
        parser = reqparse.RequestParser()
        parser.add_argument('address', required=True, help='Andress must be set', type=str)
        parser.add_argument('amount', required=True, help='Amount must be set', type=float)
        args = parser.parse_args()

        data = client.sendtoaddress(args.address, args.amount)
        if data.get('error', False):
            error = 'Your payment has been declined' if data['error']['message'] == 'Insufficient funds' else \
                data['error']['message']

            return {'result_status': False, 'message': error}, 400

        return {'result_status': True, 'result': 'Sent'}


api.add_resource(TransactionsAPI, '/transactions')
