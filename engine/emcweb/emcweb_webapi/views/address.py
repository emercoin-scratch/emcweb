# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from emcweb.emcweb_webapi.login_resource import LoginResource

from emcweb.emcweb_webapi.utils import client
from emcweb.emcweb_webapi.views import api


class AddressAPI(LoginResource):

    @staticmethod
    def get():
        """
        Get addresses
        """
        data = client.getaddressesbyaccount('')

        if data.get('error', False):
            return {'result_status': False, 'message': data['error']['message']}, 400

        return {'result_status': True, 'result': data['result']}

    @staticmethod
    def post():
        """
        Create new address
        """
        data = client.getnewaddress()
        if data.get('error', False):
            return {'result_status': False, 'message': data['error']['message']}, 400

        return {'result_status': True, 'result': data['result']}


api.add_resource(AddressAPI, '/address')
