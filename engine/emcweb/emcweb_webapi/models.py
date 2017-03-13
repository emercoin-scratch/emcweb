# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from emcweb.exts import connection


class Wallets(connection.Model):
    __tablename__ = 'wallets'
    id = connection.Column(connection.Integer, primary_key=True)
    user_id = connection.Column(connection.Integer, connection.ForeignKey('users.id'), nullable=False)
    name = connection.Column(connection.String(255), nullable=False)
    path = connection.Column(connection.String(255),  nullable=False)


class Contracts(connection.Model):
    __tablename__ = 'contracts'
    id = connection.Column(connection.Integer, primary_key=True)
    user_id = connection.Column(connection.Integer, connection.ForeignKey('users.id'), nullable=False)
    name = connection.Column(connection.Unicode(255))
    address = connection.Column(connection.Unicode(32))
    url = connection.Column(connection.Unicode(255))
    language = connection.Column(connection.Unicode(2))
    countries = connection.Column(connection.Unicode(255))
    cpc = connection.Column(connection.Float)
    keywords = connection.Column(connection.Unicode(255))
    content = connection.Column(connection.UnicodeText)
    txt = connection.relationship('ContractTexts', backref='contract', lazy='dynamic')


class ContractTexts(connection.Model):
    __tablename__ = 'contract_texts'
    id = connection.Column(connection.Integer, primary_key=True)
    contract_id = connection.Column(connection.Integer, connection.ForeignKey('contracts.id'), nullable=False)
    txt = connection.Column(connection.Unicode(255), unique=True)
