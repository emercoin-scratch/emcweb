# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from flask import render_template, current_app, redirect, url_for
from flask_login import login_required, confirm_login

from . import module_bp
from emcweb.emcweb.utils import get_block_status, get_tools_endpoint_list


@module_bp.route('settings', methods=['GET'])
@login_required
def settings():
    if current_app.config.get('DB_FALL', None):
        return redirect(url_for('emcweb.index'))

    status, _, error_str = get_block_status()
    if status != 2:
        return redirect(url_for('emcweb.index'))
    confirm_login()
    live_coin = False if not current_app.config.get('LIVECOIN_ENABLE', False) else True
    endpoint_list = get_tools_endpoint_list()
    return render_template('settings.html', live_coin=live_coin,
                           endpoint_list=endpoint_list)
