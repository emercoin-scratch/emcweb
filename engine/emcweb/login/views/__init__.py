# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import os

from flask import Blueprint

module_bp = Blueprint('login', __name__, url_prefix='/auth')

from .login import login, login_ssl
from .logout import logout
