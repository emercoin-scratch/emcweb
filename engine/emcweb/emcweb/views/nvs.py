# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from flask import render_template, redirect, url_for, current_app
from flask_login import login_required, confirm_login

from . import module_bp
from emcweb.emcweb.utils import get_block_status


@module_bp.route('nvs', methods=['GET'])
@login_required
def nvs():
    if current_app.config.get('DB_FALL', None):
        return redirect(url_for('emcweb.index'))

    status, _ = get_block_status()
    if status != 2:
        return redirect(url_for('emcweb.index'))
    confirm_login()
    return render_template('nvs.html')
