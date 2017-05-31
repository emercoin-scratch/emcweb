# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import datetime
from hashlib import md5

from flask import (redirect, url_for, request, abort,
                   session, current_app, make_response,
                   flash)
from flask_login import login_user

from ..models import Credentials, Users
from ..ssl_check import check_ssl
from . import module_bp
from emcweb.emcweb.views.index import LoginForm, CreateLoginForm
from emcweb.exts import connection


def create_cookie(page):
    cookie_name = 'strict_get_expires_nvs'
    if request.cookies.get(cookie_name, '0') == '0':
        resp = make_response(page)
        resp.set_cookie(cookie_name, value='1')


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

        session.modified = True
        session.permanent = True
        current_app.permanent_session_lifetime = datetime.timedelta(minutes=15)

        if user:
            login_user(user)
            page = redirect(url_for('emcweb.index'))
            create_cookie(page)
            return page

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

        session.modified = True
        session.permanent = True
        current_app.permanent_session_lifetime = datetime.timedelta(days=365*10)

        login_user(user)
        session['login_ssl'] = True
        page = redirect(url_for('emcweb.index'))
        create_cookie(page)
        return page

    abort(403)


@module_bp.route('/create_user', methods=['GET', 'POST'])
def create_user():
    if current_app.config.get('DB_FALL', None):
        return redirect(url_for('emcweb.index'))

    if request.method == 'GET':
        return redirect(url_for('emcweb.index'))

    # get parameters
    # add credentials

    session['loggined'] = True
    form = CreateLoginForm()
    password = md5(form.password.data.encode()).hexdigest()

    user = Users.query.first()

    if not user:
        user = Users(id=1)
        connection.session.add(user)

    cred = None
    if form.validate():
        cred = Credentials(user_id=user.id,
                           name=form.login.data,
                           password=password)
        connection.session.add(cred)
        connection.session.commit()
        session['login_password'] = True

        session.modified = True
        session.permanent = True
        current_app.permanent_session_lifetime = datetime.timedelta(minutes=15)

    if user and cred:
        login_user(user)
        page = redirect(url_for('emcweb.index'))
        create_cookie(page)
        return page

    if form.errors:
        error_str = ''
        for k, v in form.errors.items():
            if isinstance(v, list):
                value = v[0]
            else:
                value = v

            error_str = error_str + '%s: %s, ' % (form[k].label.text, value)

        flash(error_str, 'danger')
    else:
        flash('Error creating user', 'danger')
    return redirect(url_for('emcweb.index'))
