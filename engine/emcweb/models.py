# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from emcweb.exts import connection


class Settings(connection.Model):
    __tablename__ = 'settings'
    option = connection.Column(connection.String(255), primary_key=True)
    value = connection.Column(connection.String(255))
