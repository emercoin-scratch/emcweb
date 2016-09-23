# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from hashlib import md5

from flask import redirect, url_for, request, abort, session, current_app
from flask_login import login_user

from ..models import Credentials, Users
from ..ssl_check import check_ssl
from . import module_bp
from emcweb.emcweb.views.index import LoginForm


@module_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_app.config.get('DB_FALL', None):
        return redirect(url_for('emcweb.index'))

    if request.method == 'GET':
        return redirect(url_for('emcweb.index'))

    session['loggined'] = True
    form = LoginForm()
    password = md5(form.password.data.encode()).hexdigest()

    if form.validate():
        try:
            user = Users.query.filter(Credentials.name == form.login.data,
                                      Credentials.password == password).first()
            current_app.config['DB_FALL'] = 0
        except:
            current_app.config['DB_FALL'] = 2
            return redirect(url_for('emcweb.index'))

        session['login_password'] = True
        if user:
            login_user(user)
            return redirect(url_for('emcweb.index'))

    abort(403)


@module_bp.route('/login_ssl')
def login_ssl():
    if current_app.config.get('DB_FALL', None):
        return redirect(url_for('emcweb.index'))

    if check_ssl():
        try:
            user = Users.query.filter().first()
            current_app.config['DB_FALL'] = 0
        except:
            current_app.config['DB_FALL'] = 2
            return redirect(url_for('emcweb.index'))

        login_user(user)
        return redirect(url_for('emcweb.index'))

    abort(403)
