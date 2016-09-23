# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from flask import render_template, current_app, redirect, url_for
from flask_login import login_required, confirm_login

from . import module_bp
from emcweb.emcweb.utils import get_block_status


@module_bp.route('dashboard', methods=['GET'])
@login_required
def wallet():
    if current_app.config.get('DB_FALL', None):
        return redirect(url_for('emcweb.index'))

    status, _ = get_block_status()
    if status != 2:
        return redirect(url_for('emcweb.index'))
    confirm_login()
    live_coin = False if not current_app.config.get('LIVECOIN_ENABLE', False) else True
    return render_template('wallet.html', live_coin=live_coin)
