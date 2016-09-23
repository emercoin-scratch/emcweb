#!/usr/bin/env python
# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import unittest
import os

from flask_script import Manager
from flask_migrate import MigrateCommand

from emcweb import flask_app
from emcweb.exts import connection

__author__ = 'Aspanta Limited'
__email__ = 'info@aspanta.com'


manager = Manager(flask_app.create_app)
manager.add_command('db', MigrateCommand)


@manager.command
def init():
    connection.drop_all()
    connection.create_all()


@manager.command
def test():
    tests = unittest.defaultTestLoader.discover(os.path.join(os.getcwd(), 'tests'))
    unittest.TextTestRunner().run(tests)


manager.add_option('-c', '--config', help='Config file', dest='config')

if __name__ == '__main__':
    manager.run()
