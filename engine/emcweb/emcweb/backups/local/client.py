# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import datetime
import time

from flask import abort, send_file


def check_auth():
    return None


def backup(filename):
    try:
        with open(filename, mode='rb') as fd:
            data = fd.read()
    except (FileNotFoundError, IsADirectoryError, OSError):
        abort(404)
    except PermissionError:
        abort(403)

    dt = datetime.datetime.now()
    return send_file(filename,
                     mimetype='application/octet-stream',
                     as_attachment=True,
                     attachment_filename='wallet_{0}.dat'.format(int(time.mktime(dt.timetuple()))))
