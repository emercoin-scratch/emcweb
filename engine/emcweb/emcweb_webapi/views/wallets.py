# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import os
import time

from bsddb3 import db

from flask import current_app
from flask_login import current_user
from flask_restful import reqparse
from emcweb.emcweb_webapi.login_resource import LoginResource
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage

from emcweb.exts import connection
from emcweb.tasks import change_wallet
from emcweb.emcweb_webapi.models import Wallets
from emcweb.emcweb_webapi.views import api


class WalletsAPI(LoginResource):

    @staticmethod
    def get():
        """
        Returns all wallets
        """
        wallets_files = set([file for file in os.listdir(current_app.config['UPLOAD_FOLDER'])
                             if os.path.isfile(os.path.join(current_app.config['UPLOAD_FOLDER'], file))])

        wallets_db = set([wallet_model.name
                          for wallet_model in Wallets.query.filter(Wallets.user_id == current_user.id).all()])

        if not os.path.islink(os.path.join(current_app.config['EMC_HOME'], 'wallet.dat')):
            return {'result_status': False, 'message': 'wallet.dat isn\'t link'}, 400

        if os.path.dirname(os.path.normpath(os.path.realpath(
                os.path.join(current_app.config['EMC_HOME'], 'wallet.dat')))) != \
                os.path.normpath(current_app.config['UPLOAD_FOLDER']) and \
                os.path.basename(os.path.realpath(os.path.join(current_app.config['EMC_HOME'], 'wallet.dat'))) \
                not in wallets_files:
            return {'result_status': False, 'message': 'wallet.dat link isn\'t correct'}, 400

        return {
            'result_status': True,
            'result': {
                'choose': os.path.basename(os.path.realpath(os.path.join(current_app.config['EMC_HOME'],
                                                                         'wallet.dat'))),
                'wallets': list(wallets_files & wallets_db)
            }
        }

    @staticmethod
    def delete(filename):
        """
        Deletes selecting wallet
        """
        wallet = Wallets.query.filter(Wallets.user_id == current_user.id, Wallets.name == filename).first()
        if wallet:
            os.unlink(wallet.path)
            connection.session.delete(wallet)
            connection.session.commit()
        else:
            return {'result_status': False, 'message': 'Wallet not found'}, 400

        return {'result_status': True, 'result': 'Deleted'}

    @staticmethod
    def post():
        """
        Upload new wallet
        """
        parser = reqparse.RequestParser()
        parser.add_argument('filename', required=True, help='File name', location="form")
        parser.add_argument('file', type=FileStorage, required=True, help='File', location='files')
        args = parser.parse_args()

        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], secure_filename(args['filename']))
        args['file'].save(file_path)

        bsd_db = db.DB()
        try:
            bsd_db.open(file_path, flags=db.DB_RDONLY)
        except db.DBError:
            os.unlink(file_path)
            return {'result_status': False, 'message': 'File damaged or incorrect'}, 500

        new_wallet = Wallets(user_id=current_user.id,
                             name=secure_filename(args['filename']),
                             path=file_path)
        connection.session.add(new_wallet)
        connection.session.commit()

        return {'result_status': True, 'result': 'Uploaded'}, 201

    @staticmethod
    def put(filename):
        """
        Sets selecting wallet as active
        """
        try:
            result = change_wallet.delay(filename)
        except Exception:
            return {'result_status': False, 'message': 'Celery transport connection refused'}, 500
        for i in range(60):
            if result.ready():
                time.sleep(10)
                return {'result_status': True, 'result': 'Wallet changed'}
            time.sleep(1)

        time.sleep(10)

        return {'result_status': False, 'message': 'Celery hasn\'t reported about finish'}, 500


api.add_resource(WalletsAPI, '/wallets', '/wallets/<string:filename>')
