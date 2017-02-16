# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import base64
import os
import zipfile
import gzip
import shutil
from tempfile import TemporaryDirectory

from flask import current_app, make_response, abort
from flask_restful import reqparse
from emcweb.emcweb_webapi.login_resource import LoginResource

from emcssl import make_info_data, make_random_name, make_certificate, encrypt
from emcweb.emcweb_webapi.views import api
from emcweb.emcweb_webapi.utils import client


class EMCSSLAPI(LoginResource):

    @staticmethod
    def get(filename):
        parser = reqparse.RequestParser()
        parser.add_argument('bundle', type=int, required=False, default=1)
        args = parser.parse_args()

        data = None
        try:
            with open(os.path.join(current_app.config.get('CERTS_FOLDER'),
                                   '{0}.{1}'.format(filename, 'zip' if args.bundle else 'p12')), mode='rb') as fd:
                data = fd.read()
        except (FileNotFoundError, IsADirectoryError, OSError):
            abort(404)
        except PermissionError:
            abort(403)

        response = make_response(data)
        response.headers['Content-Type'] = 'application/zip' if args.bundle else 'application/x-pkcs12'
        response.headers['Content-Disposition'] = 'inline;filename="{0}.{1}"'.format(filename,
                                                                                     'zip' if args.bundle else 'p12')
        return response

    @staticmethod
    def post():
        parser = reqparse.RequestParser()
        parser.add_argument('common_name', type=str, required=True, help='CommonName must be set')
        parser.add_argument('first_name', type=str, required=True, help='First name must be set')
        parser.add_argument('last_name', type=str, required=True, help='Last name must be set')
        parser.add_argument('alias', type=str, required=True, help='Alias must be set')
        parser.add_argument('email', type=str, required=True, help='Email must be set')
        args = parser.parse_args()

        resp = client.name_show('ssh:{}'.format(args.common_name))
        if not resp.get('error', None) and not resp.get('deleted', True):
            return {'result_status': False, 'message': 'Public Key ID already used'}, 400

        temp_dir_obj = TemporaryDirectory()

        # make info file
        file_content, index, passwd = make_info_data(args)

        # write info file
        writen = False
        name = None
        for i in range(30):
            name = make_random_name()
            file_path = os.path.join(current_app.config.get('CERTS_FOLDER'), '{0}.zip'.format(name))
            if not os.path.exists(file_path):
                try:
                    with open(os.path.join(temp_dir_obj.name, '{0}.info'.format(name)), mode='w') as fd:
                        fd.write(file_content)
                    writen = True
                    break
                except OSError:
                    continue

        if not writen:
            return {'result_status': False, 'message': 'can\'t gen file name'}, 400

        # make and write ze file
        ze_data = encrypt(
            gzip.compress(
                '\n'.join([line for line in file_content.split('\n')
                           if len(line) == 0 or line[0] != '#']).encode(encoding='utf-8'),
                9
            ),
            passwd.encode(encoding='utf-8')
        )

        try:
            with open(os.path.join(temp_dir_obj.name, '{0}.ze'.format(name)), mode='wb') as fd:
                fd.write(ze_data)
        except OSError:
            return {'result_status': False, 'message': 'can\'t save file'}, 400

        try:
            if not os.path.exists(current_app.config.get('CA_CERTIFICATE', '')) \
                    or not os.path.exists(current_app.config.get('CA_PRIVATE_KEY', '')):
                return {'result_status': False, 'message': 'CA haven\'t found'}, 400
        except OSError:
            return {'result_status': False, 'message': 'can\'t open files'}, 400

        pkey, crt, p12, fingerprint = make_certificate(
            tmp_name=name,
            ca_path=current_app.config.get('CA_CERTIFICATE'),
            ca_priv_key_path=current_app.config.get('CA_PRIVATE_KEY'),
            cn=args.common_name,
            email=args.email,
            uid='info:{0}:{1}'.format(index, passwd)
        )

        code = fingerprint.replace(b':', b'').lower().decode()

        try:
            with open(os.path.join(temp_dir_obj.name, '{0}.key'.format(name)), mode='wb') as fd:
                fd.write(pkey)
            with open(os.path.join(temp_dir_obj.name, '{0}.crt'.format(name)), mode='wb') as fd:
                fd.write(crt)
            with open(os.path.join(temp_dir_obj.name, '{0}.p12'.format(name)), mode='wb') as fd:
                fd.write(p12)
        except OSError:
            return {'result_status': False, 'message': 'can\'t save files'}, 400

        # Make zip
        try:
            with zipfile.ZipFile(os.path.join(temp_dir_obj.name, '{0}.zip'.format(name)),
                                 mode='w',
                                 compression=zipfile.ZIP_DEFLATED) as zf:
                for ext in ('key', 'crt', 'p12', 'info', 'ze'):
                    zf.write(os.path.join(temp_dir_obj.name, '{0}.{1}'.format(name, ext)), '{0}.{1}'.format(name, ext))
        except OSError:
            return {'result_status': False, 'message': 'can\'t create zip file'}, 400

        try:
            shutil.move(os.path.join(temp_dir_obj.name, '{0}.zip'.format(name)),
                        os.path.join(current_app.config.get('CERTS_FOLDER'), '{0}.zip'.format(name)))
        except OSError:
            return {'result_status': False, 'message': 'can\'t move zip file'}, 400

        try:
            shutil.move(os.path.join(temp_dir_obj.name, '{0}.p12'.format(name)),
                        os.path.join(current_app.config.get('CERTS_FOLDER'), '{0}.p12'.format(name)))
        except OSError:
            return {'result_status': False, 'message': 'can\'t move p12 file'}, 400

        temp_dir_obj.cleanup()

        resp = client.name_new('ssl:{}'.format(name), 'sha256={}'.format(code), 1000)
        if resp.get('error', False):
            return {
                'result_status': False,
                'message': format(resp['error']['message'])
            }, 400

        
        ze_data_base64 = base64.b64encode(ze_data).decode('utf-8')

        resp = client.name_new('info:{}'.format(index), ze_data_base64, 1000, '', 'base64')
        if resp.get('error', False):
            return {
                'result_status': False,
                'message': format(resp['error']['message'])
            }, 400

        resp = client.name_new('ssh:{}'.format(args.common_name), name, 1000)
        if resp.get('error', False):
            return {
                'result_status': False,
                'message': format(resp['error']['message'])
            }, 400

        return {'result_status': True, 'result': {'name': name, 'value': code}}


api.add_resource(EMCSSLAPI, '/certs', '/certs/<string:filename>')
