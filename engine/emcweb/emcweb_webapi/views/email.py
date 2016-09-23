# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from flask import current_app
from flask_restful import reqparse
from emcweb.emcweb_webapi.login_resource import LoginResource
from jinja2 import Template, TemplateSyntaxError, TemplateError

from emcweb.emcweb_webapi.views import api
from emcweb.tasks import sendmail


class EmailAPI(LoginResource):

    @staticmethod
    def post():
        parser = reqparse.RequestParser()
        parser.add_argument('message', required=False, type=str, default='')
        parser.add_argument('email', required=True, help='Email must be set', type=str)
        parser.add_argument('address', required=True, help='Address must be set', type=str)
        parser.add_argument('amount', required=True, help='Amount must be set or incorrect value', type=float)
        args = parser.parse_args()

        template_path = current_app.config.get('EMAIL_TEMPLATE', None)
        if not template_path:
            return {'result_status': False, 'message': 'Template doesn\'t set'}, 400

        try:
            with open(template_path, 'r') as f:
                template_text = f.read()
        except FileNotFoundError:
            return {'result_status': False, 'message': 'Template doesn\'t found'}, 400
        except PermissionError:
            return {'result_status': False, 'message': 'Template permission denied'}, 400
        except IsADirectoryError:
            return {'result_status': False, 'message': 'Template is a directory'}, 400
        except OSError:
            return {'result_status': False, 'message': 'Template unknown error'}, 400

        try:
            template = Template(template_text)
            data = template.render(message=args.get('message', ''),
                                   amount=args.get('amount'),
                                   address=args.get('address'))
        except TemplateSyntaxError:
            return {'result_status': False, 'message': 'Template syntax error'}, 400
        except TemplateError:
            return {'result_status': False, 'message': 'Template render error'}, 400

        try:
            sendmail.delay(args.email, data)
        except Exception:
            return {'result_status': False, 'message': 'Celery transport connection refused'}, 500

        return {'result_status': True, 'result': 'Task created'}


api.add_resource(EmailAPI, '/email')
