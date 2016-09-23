# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from .app import flask_app
from emcweb.exts import celery

__author__ = 'Aspanta Limited'
__email__ = 'info@aspanta.com'
__all__ = 'flask_app',


# Task for broker tesy
@celery.task
def test_celery():
    return 0
