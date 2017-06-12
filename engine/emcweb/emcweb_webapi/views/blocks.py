# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from emcweb.emcweb_webapi.login_resource import LoginResource

from emcweb.emcweb_webapi.views import api
from emcweb.emcweb.utils import get_block_status


class BlocksAPI(LoginResource):

    @staticmethod
    def get():
        """
        Get blocks loading status
        """
        status, blocks, error_str = get_block_status()

        if error_str:
            return {'result_status': False, 'message': error_str}, 500

        return {'result_status': True, 'result': {'blocks_ready': status,
                                                  'blocks': blocks}}

api.add_resource(BlocksAPI, '/blocks')
