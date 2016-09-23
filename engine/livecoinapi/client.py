# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import requests
import hmac


class APIError(BaseException):
    pass


class LiveCoinClient(object):
    """
    Simple LiveCoin client
    """
    URL = 'https://api.livecoin.net'

    def __init__(self, api_key, secret):
        self.api_key = api_key
        self.secret = secret

    @staticmethod
    def make_sign(post_body, secret):
        msg_sign = '&'.join(['{0}={1}'.format(key, value) for key, value in sorted(post_body.items())]) \
            if post_body else ''
        hash_obj = hmac.new(secret.encode(), msg_sign.encode(), digestmod='sha256')
        return hash_obj.hexdigest().upper()

    def call(self, method, command, post_data=None):
        headers = {
            'Api-Key': self.api_key,
            'Sign': self.make_sign(post_data, self.secret)
        }

        url = '{0}{1}'.format(self.URL, command)

        try:
            if post_data:
                if method == 'get':
                    data = getattr(requests, method)(url=url, params=post_data, headers=headers)
                else:
                    data = getattr(requests, method)(url=url, data=post_data, headers=headers)
            else:
                data = getattr(requests, method)(url=url, headers=headers)
        except requests.exceptions.ConnectionError as e:
            raise APIError(str(e))

        if data.status_code >= 400:
            raise APIError(data.text)

        return data.json()
