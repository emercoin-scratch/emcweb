# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from flask_restful import reqparse
from emcweb.emcweb_webapi.login_resource import LoginResource

from emcweb.emcweb_webapi.utils import client
from emcweb.emcweb_webapi.views import api


class MessagesAPI(LoginResource):

    @staticmethod
    def post():
        parser = reqparse.RequestParser()
        parser.add_argument('address', required=True, help='Address must be set')
        parser.add_argument('message', required=True, help='Message must be set')
        args = parser.parse_args()

        data = client.signmessage(args['address'], args['message'])
        if data.get('error', False):
            return {'result_status': False, 'message': data['error']['message']}, 400

        return {'result_status': True, 'result': data['result']}

    @staticmethod
    def get():
        parser = reqparse.RequestParser()
        parser.add_argument('address', required=True, help='Address must be set')
        parser.add_argument('signature', required=True, help='Signature must be set')
        parser.add_argument('message', required=True, help='Message must be set')
        args = parser.parse_args()

        data = client.verifymessage(args['address'], args['signature'], args['message'])
        if data.get('error', False):
            return {'result_status': False, 'message': data['error']['message']}, 400

        return {'result_status': True, 'result': data['result']}


api.add_resource(MessagesAPI, '/messages')
