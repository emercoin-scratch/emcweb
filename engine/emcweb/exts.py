# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from celery import Celery


connection = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
celery = Celery()
