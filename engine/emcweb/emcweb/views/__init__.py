# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import os

from flask import Blueprint

module_bp = Blueprint('emcweb', __name__, url_prefix='/', template_folder=os.path.join('..', 'templates'))

import emcweb.emcweb.views.index
import emcweb.emcweb.views.wallet
import emcweb.emcweb.views.minfo
import emcweb.emcweb.views.receive
import emcweb.emcweb.views.sign
import emcweb.emcweb.views.nvs
import emcweb.emcweb.views.settings
import emcweb.emcweb.views.backup
import emcweb.emcweb.views.wallets
import emcweb.emcweb.views.emcssl
import emcweb.emcweb.views.emcssh
import emcweb.emcweb.views.emclnx
import emcweb.emcweb.views.block
import emcweb.emcweb.views.config
