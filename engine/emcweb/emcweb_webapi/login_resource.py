# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from flask_restful import Resource
from flask_login import login_required, confirm_login


class LoginResource(Resource):
    method_decorators = [login_required]

    def dispatch_request(self, *args, **kwargs):
        confirm_login()
        return super(LoginResource, self).dispatch_request(*args, **kwargs)
