# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import os

from flask import render_template, redirect, url_for, current_app
from flask_login import login_required, confirm_login

from . import module_bp
from emcweb.emcweb.utils import get_block_status


@module_bp.route('wallets', methods=['GET'])
@login_required
def wallets():
    if current_app.config.get('DB_FALL', None):
        return redirect(url_for('emcweb.index'))

    status, _, error_str = get_block_status()
    if status != 2:
        return redirect(url_for('emcweb.index'))

    confirm_login()
    return render_template(
        'wallets.html',
        google=os.path.exists(os.path.join(os.path.dirname(__file__),
                                           '..', '..', '..', 'static', 'google_secrets.json'))
    )
