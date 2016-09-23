# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from flask import Blueprint
from flask_restful import Api


errors = {
    'BadRequest': {
        'message': 'Request error',
        'result_status': False,
        'status': 400
    },
    'Unauthorized': {
        'message': "Unauthorized",
        'result_status': False,
        'status': 401
    },
    'Forbidden': {
        'message': 'Permission denied',
        'result_status': False,
        'status': 403
    },
    'NotFound': {
        'message': 'Not found',
        'result_status': False,
        'status': 404
    },
    'MethodNotAllowed': {
        'message': 'Method not allowed',
        'result_status': False,
        'status': 405
    }
}


# Prepair blueprint
module_bp = Blueprint('emcweb_webapi', __name__, url_prefix='/webapi')
api = Api(module_bp, errors=errors)


# load views
import emcweb.emcweb_webapi.views.emcssh
import emcweb.emcweb_webapi.views.emcssh_users
import emcweb.emcweb_webapi.views.emcssl
import emcweb.emcweb_webapi.views.emclnx
import emcweb.emcweb_webapi.views.email
import emcweb.emcweb_webapi.views.livecoin
import emcweb.emcweb_webapi.views.backup_list
import emcweb.emcweb_webapi.views.nvs
import emcweb.emcweb_webapi.views.messages
import emcweb.emcweb_webapi.views.settings
import emcweb.emcweb_webapi.views.transactions
import emcweb.emcweb_webapi.views.balance
import emcweb.emcweb_webapi.views.address
import emcweb.emcweb_webapi.views.info
import emcweb.emcweb_webapi.views.blocks
import emcweb.emcweb_webapi.views.encrypt
import emcweb.emcweb_webapi.views.wallets
