# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from flask import render_template, redirect, url_for, current_app
from flask_login import login_required, confirm_login

from . import module_bp
from emcweb.emcweb.utils import get_block_status


@module_bp.route('emclnx', methods=['GET'])
@login_required
def emclnx():
    if current_app.config.get('DB_FALL', None):
        return redirect(url_for('emcweb.index'))

    status, _, error_str = get_block_status()
    if status != 2:
        return redirect(url_for('emcweb.index'))
    confirm_login()
    return render_template('emclnx.html')
