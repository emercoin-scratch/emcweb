# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from flask import session
from flask_restful import reqparse
from emcweb.emcweb_webapi.login_resource import LoginResource

from emcweb.emcweb_webapi.utils import client
from emcweb.emcweb_webapi.views import api


def get_actives_nvs(objects):
    result = []

    for item in objects:
        if not item.get('transferred', False) and item.get('expires_in', 0) >= 0:
            item['expires_in'] = round(item['expires_in'] / 182)
            result.append(item)
    return result

def get_expires_nvs(objects):
    result = []
     
    all_nvs = get_actives_nvs(objects)
    for obj in all_nvs:
        if obj['expires_in'] <= 10:
            result.append(obj)
    
    return result

class NVSAPI(LoginResource):

    @staticmethod
    def get():
        parser = reqparse.RequestParser()
        parser.add_argument('expires', required=False, help='Get expires only')
        args = parser.parse_args()
        
        expires_only = getattr(args, 'expires', 0) == '1'

        data = client.name_list('', 'base64')
        if data.get('error', False):
            return {'result_status': False, 'message': data['error']['message']}, 400

        if expires_only:
            result = get_expires_nvs(data['result'])
        else:
            result = get_actives_nvs(data['result'])

        return {'result_status': True, 'result': result}

    @staticmethod
    def post():
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=True, help='Need set name')
        parser.add_argument('value', type=str, required=True, help='Need set value')
        parser.add_argument('days', type=int, required=True, help='Need set days')
        parser.add_argument('typeOfData', type=str, required=True, help='Need set type of data')
        args = parser.parse_args()

        data_type = ''
        if not args.typeOfData == 'utf8':
            data_type = args.typeOfData
        data = client.name_new(args.name, args.value, args.days, '', data_type)

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
        parser.add_argument('typeOfData', type=str, required=False, help='Need set type of data')
        args = parser.parse_args()

        addr = args.address if args.address else ''
        datatype = ''
        if args.typeOfData and not args.typeOfData=='utf8':
            datatype = args.typeOfData
        params = [args.name, args.value, args.days, addr, datatype]
        
        data = client.name_update(*params)
        if data.get('error', False):
            return {'result_status': False, 'message': data['error']['message']}, 400

        return {'result_status': True, 'message': 'Name updated: {}'.format(data['result'])}


api.add_resource(NVSAPI, '/nvs')
