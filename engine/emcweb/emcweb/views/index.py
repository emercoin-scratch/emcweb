# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import os

from time import sleep

from flask import (render_template, redirect, app,
                   url_for, request, current_app,
                   make_response, session)
from flask_login import current_user
from flask_wtf import Form
from wtforms.fields import StringField, PasswordField
from wtforms.validators import DataRequired

from . import module_bp
from emcweb.emcweb.utils import get_block_status
from emcweb.utils import apply_db_settings
from emcweb.exts import connection


class LoginForm(Form):
    login = StringField('Login', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])


@module_bp.route('/')
def index():
    if current_app.config.get('DB_FALL', None):
        try:
            apply_db_settings(current_app)
            current_app.config['DB_FALL'] = 0
        except:
            return render_template('err_conf.html',
                                   message='MySQL database is not configured'
                                   if current_app.config['DB_FALL'] == 1 else 'MySQL connection refused')

    status, _, error_str = get_block_status()
    if status != 2:
        return render_template('blocks.html', error_message=error_str)

    serial = request.environ.get('SSL_CLIENT_M_SERIAL')

    return redirect(url_for('emcweb.wallet')) \
        if current_user.is_authenticated else render_template('index.html',
                                                              form=LoginForm(),
                                                              enable_ssl=True if serial else False)
