# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import os
import time

from flask import current_app
from flask_restful import reqparse
from emcweb.tasks import save_to_file
from emcweb.emcweb_webapi.login_resource import LoginResource

from emcweb.emcweb_webapi.views import api


class EMERVPNAPI(LoginResource):

    @staticmethod
    def get():
        emervpn_keys = os.path.join(current_app.config.get('EMCSSH_KEYS_DIR', '/etc/emercoin/emcssh.keys.d'),
                                    current_app.config.get('EMERVPN_EMCSSH', 'emervpn'))
        emcssh_keys_text = []
        try:
            with open(emervpn_keys, 'r') as f:
                for line in f.readlines():
                    if line.strip() and not line.strip().startswith('#'):
                        emcssh_keys_text.append(line.strip())
        except FileNotFoundError:
            return {'result_status': False, 'message': 'File not found'}, 400

        return {'result_status': True, 'result': emcssh_keys_text}

    @staticmethod
    def post():
        parser = reqparse.RequestParser()
        parser.add_argument('data', required=False, type=str, default='')
        args = parser.parse_args()

        emervpn_keys = os.path.join(current_app.config.get('EMCSSH_KEYS_DIR',
                                                          '/etc/emercoin/emcssh.keys.d'),
                                    current_app.config.get('EMERVPN_EMCSSH',
                                                          'emervpn'))
        try:
            create_res = save_to_file.delay(emervpn_keys, args.data)
        except Exception:
            return {'result_status': False, 'message': 'Celery transport connection refused'}, 400
        else:
            seconds = 200
            while seconds > 0:
                if create_res.ready():
                    result = create_res.result
                    if result['result_status']:
                        return result
                    else:
                        return result, 400
                    break
                time.sleep(1)
                seconds -= 1
            return {'result_status': False, 'message': 'Celery hasn\'t reported about finish'}, 400

        return {'result_status': True, 'result': 'Saved'}


api.add_resource(EMERVPNAPI, '/emervpn')
