# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import requests
import ujson


__author__ = 'Aspanta Limited'
__email__ = 'info@aspanta.com'


class EMCClient(object):
    """
    Simple EMC client
    """
    METHODS = ['getaddressesbyaccount', 'getdifficulty', 'getnewaddress', 'listtransactions', 'sendtoaddress',
               'getbalance', 'getinfo', 'signmessage', 'name_list', 'name_show', 'name_delete', 'name_new',
               'name_update', 'name_history', 'backupwallet', 'encryptwallet', 'dumpprivkey', 'walletlock',
               'walletpassphrase', 'verifymessage']

    def __init__(self,
                 host='localhost',
                 port=80,
                 user=None,
                 password='',
                 verify=True,
                 protocol='http'):
        self.host = host
        self.port = port
        self.user = user
        self.password = password
        self.verify = verify
        self.protocol = protocol

    def call_command(self, command, *args):
        credentials = '{}:{}@'.format(self.user,
                                      self.password) if self.user else ''
        url = '{}://{}{}:{}'.format(self.protocol,
                                    credentials,
                                    self.host,
                                    self.port)

        data = {
            'method': command
        }

        if args:
            data['params'] = args

        try:
            data = requests.post(url=url, data=ujson.dumps(data), verify=self.verify).json()
        except requests.exceptions.ConnectionError as e:
            return {'result': None, 'error': {'message': 'Server connection error', 'code': -9999}}
        except ValueError:
            return {'result': None, 'error': {'message': 'Server is not responsing', 'code': -9998}}

        return data

    def __getattr__(self, item):
        if item not in self.METHODS:
            raise AttributeError('EMC Client doesn\'t have method %s' % item)

        def run(*args):
            return self.call_command(item, *args)
        return run
