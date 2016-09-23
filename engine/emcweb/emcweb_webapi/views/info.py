# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from emcweb.emcweb_webapi.login_resource import LoginResource
from emcweb.emcweb_webapi.utils import client
from emcweb.emcweb_webapi.views import api


class InfoAPI(LoginResource):
    @staticmethod
    def get():
        info = client.getinfo()
        if info.get('error', False):
            return {'result_status': False, 'message': info['error']['message']}, 400

        infodif = client.getdifficulty()
        if infodif.get('error', False):
            return {'result_status': False, 'message': infodif['error']['message']}, 400

        return {'result_status': True, 'result': {'info': info['result'], 'infodif': infodif['result']}}


api.add_resource(InfoAPI, '/info')
