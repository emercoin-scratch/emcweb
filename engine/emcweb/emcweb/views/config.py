# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from . import module_bp
from flask import redirect, url_for


@module_bp.route('config')
def config():
    return redirect('/')
