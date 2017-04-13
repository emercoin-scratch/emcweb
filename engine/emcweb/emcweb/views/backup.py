# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import os
import importlib
import random
import string

from flask import request, render_template, current_app
from flask_login import login_required

from ..utils import client
from . import module_bp


@module_bp.route('backup', methods=['GET'])
@login_required
def backup():
    engine = request.args.get('engine')
    if not engine:
        return render_template('backup_error.html', error='Please choose engine')

    data = importlib.import_module('emcweb.emcweb.backups.%s' % engine).check_auth()
    if data:
        return data

    upload_folder = current_app.config.get('UPLOAD_FOLDER','/var/lib/emcweb/uploads')
    default_backup = os.path.join(
                  os.path.dirname(upload_folder),
                  'backups')
    backup_folder = current_app.config.get('BACKUP_FOLDER', default_backup)

    filename = os.path.join(backup_folder, ''.join([random.choice(string.ascii_lowercase + string.digits) for _ in range(10)]))
    data = client.backupwallet(filename)
    if data['error']:
        return render_template('backup_error.html', error='Get wallet error')

    return importlib.import_module('emcweb.emcweb.backups.%s' % engine).backup(filename)


@module_bp.route('backup/auth', methods=['GET'])
@login_required
def backup_auth():
    engine = request.args.get('engine')
    if not engine:
        return render_template('backup_error.html', error='Please choose engine')
    return importlib.import_module('emcweb.emcweb.backups.%s' % engine).auth()
