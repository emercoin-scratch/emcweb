# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import httplib2
import datetime
import time

from flask import session, redirect, url_for, request, render_template
from apiclient import discovery
from googleapiclient.http import MediaFileUpload
from oauth2client import client


def check_auth():
    # check google session
    if 'google_credentials' not in session:
        return redirect(url_for('emcweb.backup_auth', engine='google'))

    # load google session
    credentials = client.OAuth2Credentials.from_json(session['google_credentials'])
    if credentials.access_token_expired:
        return redirect(url_for('emcweb.backup_auth', engine='google'))

    return None


def backup(filename):
    # make google client
    credentials = client.OAuth2Credentials.from_json(session['google_credentials'])
    http_auth = credentials.authorize(httplib2.Http())
    drive_service = discovery.build('drive', 'v3', http_auth)

    media = MediaFileUpload(
        filename,
        mimetype='application/octet-stream',
        resumable=True
    )

    dt = datetime.datetime.now()
    file_metadata = {
        'name': 'wallet_{0}.dat'.format(int(time.mktime(dt.timetuple()))),
        'mimeType': 'application/octet-stream'
    }

    drive_service.files().create(body=file_metadata, media_body=media, fields='id').execute()
    return render_template('backup_done.html')


def auth():
    # make oauth authorisation object
    flow = client.flow_from_clientsecrets(
        'static/google_secrets.json',
        scope='https://www.googleapis.com/auth/drive.file',
        redirect_uri=url_for('emcweb.backup_auth', engine='google', _external=True)
    )

    # go to google oauth
    if 'code' not in request.args:
        auth_uri = flow.step1_get_authorize_url()
        return redirect(auth_uri)

    # back to backup method
    auth_code = request.args.get('code')
    credentials = flow.step2_exchange(auth_code)
    session['google_credentials'] = credentials.to_json()
    return redirect(url_for('emcweb.backup', engine='google'))
