# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from emcweb.emcweb_webapi.login_resource import LoginResource

from emcweb.emcweb_webapi.utils import client
from emcweb.emcweb_webapi.views import api


class BalanceAPI(LoginResource):

    @staticmethod
    def get():
        data = client.getbalance()
        if data.get('error', False):
            return {'result_status': False, 'message': data['error']['message']}, 400

        return {'result_status': True, 'result': float(format(data['result'], '.8f')) if data['result'] else 0}


api.add_resource(BalanceAPI, '/balance')
