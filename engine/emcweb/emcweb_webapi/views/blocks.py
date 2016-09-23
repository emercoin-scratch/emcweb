# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from emcweb.emcweb_webapi.login_resource import LoginResource

from emcweb.emcweb_webapi.utils import client
from emcweb.emcweb_webapi.views import api


class BlocksAPI(LoginResource):

    @staticmethod
    def get():
        """
        Get blocks loading status
        """
        data = client.getinfo()

        if (data.get('error') and data['error']['code'] == -9999) or not data.get('result'):
            return {'result_status': False, 'message': 'Server connection error'}, 500

        status = False if 'Checkpoint is too old' in data['result']['errors'] else True
        return {'result_status': True, 'result': {'blocks_ready': status, 'blocks': data['result']['blocks']}}


api.add_resource(BlocksAPI, '/blocks')
