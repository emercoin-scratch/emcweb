# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import os

from flask import current_app
from flask_restful import reqparse
from emcweb.emcweb_webapi.login_resource import LoginResource

from emcweb.emcweb_webapi.views import api


class EMCSSHAPI(LoginResource):

    @staticmethod
    def get():
        emcssh_keys = os.path.join(current_app.config.get('EMCSSH_KEYS_DIR', '/etc/emercoin/emcssh.keys.d'),
                                   current_app.config.get('EMCSSH_VERIFY_USER', 'emc'))

        try:
            with open(emcssh_keys, 'r') as f:
                emcssh_keys_text = [line.strip() for line in f.readlines()]
        except FileNotFoundError:
            return {'result_status': False, 'message': 'File not found'}, 400

        return {'result_status': True, 'result': emcssh_keys_text}

    @staticmethod
    def post():
        parser = reqparse.RequestParser()
        parser.add_argument('data', required=False, type=str, default='')
        args = parser.parse_args()

        emcssh_keys = os.path.join(current_app.config.get('EMCSSH_KEYS_DIR', '/etc/emercoin/emcssh.keys.d'),
                                   current_app.config.get('EMCSSH_VERIFY_USER', 'emc'))

        try:
            with open(emcssh_keys, 'w') as f:
                f.write(args.data)
        except FileNotFoundError:
            return {'result_status': False, 'message': 'Emcssh file doesn\'t found'}, 400
        except PermissionError:
            return {'result_status': False, 'message': 'Emcssh file permission denied'}, 400
        except IsADirectoryError:
            return {'result_status': False, 'message': 'Emcssh file is a directory'}, 400
        except OSError:
            return {'result_status': False, 'message': 'Emcssh file access problem'}, 400

        return {'result_status': True, 'result': 'Saved'}


api.add_resource(EMCSSHAPI, '/emc_ssh')
