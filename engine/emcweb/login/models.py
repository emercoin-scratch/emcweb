# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from flask import session
from flask_login import UserMixin

from .ssl_check import check_ssl
from emcweb.exts import connection


class Users(connection.Model, UserMixin):
    __tablename__ = 'users'
    id = connection.Column(connection.Integer, primary_key=True)

    @property
    def is_authenticated(self):
        if session.get('login_password', False) or check_ssl():
            return True
        return False


class Credentials(connection.Model):
    __tablename__ = 'credentials'
    id = connection.Column(connection.Integer, primary_key=True)
    user_id = connection.Column(connection.Integer, connection.ForeignKey('users.id'), nullable=False)
    name = connection.Column(connection.String(255))
    password = connection.Column(connection.String(255))
