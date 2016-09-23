# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import os
from emcweb import flask_app

flask_app.create_app(config=os.path.join('..', 'settings', 'flask.py'))
celery = flask_app.create_celery()

