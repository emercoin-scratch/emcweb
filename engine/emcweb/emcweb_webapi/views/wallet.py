# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import os
import sys
import time
from bsddb3 import db
from pathlib import Path

from flask import current_app
from flask_login import current_user
from flask_restful import reqparse
from emcweb.emcweb_webapi.login_resource import LoginResource
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage

from emcweb.exts import connection
from emcweb.tasks import create_empty_wallet
from emcweb.emcweb_webapi.models import Wallets
from emcweb.emcweb_webapi.views import api


class WalletAPI(LoginResource):
    @staticmethod
    def post():
        """
        Create new wallet
        """
        result = {'result_status': False,
                  'result': False,
                  'message':''}

        parser = reqparse.RequestParser()
        parser.add_argument('name')
        args = parser.parse_args()

        s_name =  secure_filename(args['name'])
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], s_name)

        exsists_name = Wallets.query.filter(Wallets.name == s_name).all()

        if exsists_name or Path(file_path).is_file():
            result['result'] = False
            result['message'] = 'The name already exists!'
        else:
            try:
                create_res = create_empty_wallet.delay(s_name)
            except Exception:
                result['result_status'] = False
                result['message'] = 'Celery transport connection refused'
            else:
                seconds = 200
                while seconds>0:
                    if create_res.ready():
                        result['result_status'] = True
                        result['result'] = True
                        result['message'] = 'Wallet created'
                        break
                    time.sleep(1)
                    seconds -= 1
                if not result['result_status']:
                    result['result_status'] = False
                    result['result'] = False
                    result['message'] = 'Celery hasn\'t reported about finish'

        if result['result_status'] and result['result']:
            new_wallet = Wallets(user_id=current_user.id,
                                 name=s_name,
                                 path=file_path)
            connection.session.add(new_wallet)
            connection.session.commit()
        
        if result['result_status']:
            return result, 201
        else:
            return result, 500

    @staticmethod
    def get():
        pass
        return {'result_status': True, 'result': 'Opened'}, 201

api.add_resource(WalletAPI, '/wallet', '/wallet/<string:name>')
