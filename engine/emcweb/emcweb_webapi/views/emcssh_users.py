# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import os

from flask import current_app
from flask_restful import reqparse
from emcweb.emcweb_webapi.login_resource import LoginResource

from emcweb.emcweb_webapi.views import api


class EMCSSHUsersAPI(LoginResource):

    @staticmethod
    def get():
        try:
            emcssh_users = os.listdir(current_app.config.get('EMCSSH_KEYS_DIR', '/etc/emercoin/emcssh.keys.d'))
        except OSError:
            return {'result_status': False, 'message': 'Can\'t read emcssh config dir'}, 400

        users = []
        for user in emcssh_users:
            if user == current_app.config.get('EMCSSH_VERIFY_USER', 'emc'):
                continue
            emcssh_user_file = os.path.join(current_app.config.get('EMCSSH_KEYS_DIR', '/etc/emercoin/emcssh.keys.d'),
                                            user)
            try:
                with open(emcssh_user_file, 'r') as f:
                    user_data = [line.strip() for line in f.readlines()]
                if len(user_data) == 0:
                    user_data.append('')

            except OSError:
                continue

            users.append({'name': user, 'data': user_data})
        return {'result_status': True, 'result': users}

    @staticmethod
    def post():
        parser = reqparse.RequestParser()
        parser.add_argument('name', required=True, type=str, help='Name must be set')
        parser.add_argument('data', required=False, type=str, default='')
        args = parser.parse_args()

        emcssh_key = os.path.join(current_app.config.get('EMCSSH_KEYS_DIR', '/etc/emercoin/emcssh.keys.d'),
                                  args.name)
        try:
            with open(emcssh_key, 'w') as f:
                f.write(args.data)
        except OSError:
            return {'result_status': False, 'message': 'File create problems'}, 400

        return {'result_status': True, 'result': 'Saved'}

    @staticmethod
    def delete():
        parser = reqparse.RequestParser()
        parser.add_argument('name', required=True, type=str, help='Name must be set')
        args = parser.parse_args()

        emcssh_key = os.path.join(current_app.config.get('EMCSSH_KEYS_DIR', '/etc/emercoin/emcssh.keys.d'),
                                  args.name)
        try:
            os.unlink(emcssh_key)
        except OSError:
            return {'result_status': False, 'message': 'File remove problems'}, 400

        return {'result_status': True, 'result': 'Deleted'}


api.add_resource(EMCSSHUsersAPI, '/emc_ssh_users')
