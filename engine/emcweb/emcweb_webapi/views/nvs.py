# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from flask_restful import reqparse
from emcweb.emcweb_webapi.login_resource import LoginResource

from emcweb.emcweb_webapi.utils import client
from emcweb.emcweb_webapi.views import api


class NVSAPI(LoginResource):

    @staticmethod
    def get():
        data = client.name_list()
        if data.get('error', False):
            return {'result_status': False, 'message': data['error']['message']}, 400

        result = []

        for item in data['result']:
            if not item.get('transferred', False):
                item['expires_in'] = round(item['expires_in'] / 175)
                result.append(item)

        return {'result_status': True, 'result': result}

    @staticmethod
    def post():
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help='Need set name')
        parser.add_argument('value', type=str, required=True, help='Need set value')
        parser.add_argument('days', type=int, required=True, help='Need set days')
        args = parser.parse_args()

        data = client.name_new(args.name, args.value, args.days)

        if data.get('error', False):
            return {'result_status': False, 'message': data['error']['message']}, 400

        return {'result_status': True, 'message': 'Name created: {}'.format(data['result'])}

    @staticmethod
    def delete():
        parser = reqparse.RequestParser()
        parser.add_argument('name', required=True, help='Need set name')
        args = parser.parse_args()

        data = client.name_delete(args.name)
        if data.get('error', False):
            return {'result_status': False, 'message': data['error']['message']}, 400

        return {'result_status': True, 'message': 'Name deleted: {}'.format(data['result'])}

    @staticmethod
    def put():
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help='Need set name')
        parser.add_argument('value', type=str, required=True, help='Need set value')
        parser.add_argument('days', type=int, required=True, help='Need set days')
        parser.add_argument('address', type=str, required=False, help='Need set address')
        args = parser.parse_args()

        params = [args.name, args.value, args.days]
        if args.address:
            params.append(args.address)

        data = client.name_update(*params)
        if data.get('error', False):
            return {'result_status': False, 'message': data['error']['message']}, 400

        return {'result_status': True, 'message': 'Name updated: {}'.format(data['result'])}


api.add_resource(NVSAPI, '/nvs')
