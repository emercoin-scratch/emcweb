# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from flask import redirect, url_for, session, current_app
from flask_login import logout_user

from . import module_bp


__author__ = 'Aspanta Limited'
__email__ = 'info@aspanta.com'


@module_bp.route('/logout', methods=['GET'])
def logout():
    if current_app.config.get('DB_FALL', None):
        return redirect(url_for('emcweb.index'))

    session['login_password'] = False
    logout_user()
    return redirect(url_for('emcweb.index'))
