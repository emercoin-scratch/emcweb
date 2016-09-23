# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import importlib

from flask import current_app
from emcweb.emcweb_webapi.login_resource import LoginResource

from emcweb.emcweb_webapi.views import api


class BackupListAPI(LoginResource):

    @staticmethod
    def get():
        backup_modules = dict()
        for backup_module in current_app.config.get('BACKUP_MODULES', []):
            backup_modules[backup_module] = importlib.import_module('emcweb.emcweb.backups.%s' % backup_module)

        if not backup_modules:
            return {
                'result_status': False,
                'message': 'Not found any backup modules'
            }

        return {
            'result_status': True,
            'result': [{'title': value.__name__, 'module': key} for key, value in backup_modules.items()]
        }


api.add_resource(BackupListAPI, '/backup_list')
