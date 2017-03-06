# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import os

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
from emcweb.tasks import check_wallet_symlink
from emcweb.config import generate_secret_key
from emcweb.exts import connection

from emcweb.emcweb_webapi.models import Wallets

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

    status, _ = get_block_status()
    if status != 2:
        return render_template('blocks.html')

    serial = request.environ.get('SSL_CLIENT_M_SERIAL')   
    
    wallet_name = generate_secret_key(8)
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], wallet_name)

    result = check_wallet_symlink.delay(wallet_name)
    if result.get(timeout=500) > 0:
        new_wallet = Wallets(user_id=current_user.id,
                                 name=wallet_name,
                                 path=file_path)
        connection.session.add(new_wallet)
        connection.session.commit()

    return redirect(url_for('emcweb.wallet')) \
        if current_user.is_authenticated else render_template('index.html',
                                                              form=LoginForm(),
                                                              enable_ssl=True if serial else False)
