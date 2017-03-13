# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import os

from urllib.parse import urlsplit
from dns.resolver import query
from dns.exception import DNSException

from flask import abort
from flask_login import current_user
from flask_restful import reqparse, inputs

from emcweb.exts import connection
from emcweb.emcweb_webapi.login_resource import LoginResource
from emcweb.emcweb_webapi.views import api
from emcweb.emcweb_webapi.utils import client
from emcweb.emcweb_webapi.models import Contracts, ContractTexts


def chk_dns(domain, address):
    try:
        answers = query(urlsplit(domain).netloc, 'TXT')
    except DNSException:
        return False

    for rdata in answers:
        if rdata.to_text() == '"emclnx={0}"'.format(address):
            return True

    return False


def get_days(name):
    resp = client.name_show('lnx:{}'.format(name))
    if resp.get('error'):
        return None
    return round(resp['result']['expires_in'] / 175)


class EMCLNXAPI(LoginResource):

    @staticmethod
    def get():
        contracts_db = Contracts.query.filter(Contracts.user_id == current_user.id).all()

        contracts = [
            {
                'name': contract.name,
                'address': contract.address,
                'url': contract.url,
                'language': contract.language,
                'countries': contract.countries,
                'cpc': contract.cpc,
                'keywords': contract.keywords,
                'txt': [txt.txt for txt in contract.txt],
                'days': get_days(contract.name) if get_days(contract.name) else -1,
                'dns': chk_dns(contract.url, contract.address)
            } for contract in contracts_db
        ]

        return {'result_status': True, 'result': contracts}

    @staticmethod
    def post():
        parser = reqparse.RequestParser()
        parser.add_argument('name', required=True, location='json', type=str, help='Name must be set')
        parser.add_argument('address', required=True, location='json', type=inputs.regex('^[a-zA-Z0-9]{34}$'),
                            help='Address must be set')
        parser.add_argument('url', required=True, location='json', type=inputs.regex('^http(s)?:\/\/.*$'),
                            help='URL must be set')
        parser.add_argument('lang', required=True, location='json', type=inputs.regex('^[A-Z]{2}$'),
                            help='Lang must be set')
        parser.add_argument('country', required=True, location='json',
                            type=inputs.regex('^([A-Z]{2}(,[A-Z]{2})*|ALL)$'), help='Country must be set')
        parser.add_argument('cpc', required=True, location='json', type=float,
                            help='CPC must be set or incorrect value')
        parser.add_argument('keywords', required=True, location='json', type=str, help='Keywords must be set')
        parser.add_argument('days', required=True, location='json', type=int, help='Days must be set')
        parser.add_argument('txt', required=True, location='json', type=list, help='TXT must be set')
        args = parser.parse_args()

        resp = client.signmessage(args.address, args.name)
        if resp.get('error', False):
            return {'result_status': False, 'message': resp['error']['message']}, 400

        contract_content = """URL={url}
SIGNATURE={signature}
LANG={lang}
COUNTRY={country}
CPC={cpc}
KEYWORDS={keywords}
{txt}
""".format(url=args.url,
           signature=resp['result'],
           lang=args.lang,
           country=args.country,
           cpc=args.cpc,
           keywords=args.keywords,
           txt='\n'.join(['TXT={}'.format(txt) for txt in args.txt]))

        contract = Contracts(user_id=current_user.id,
                             name=args.name,
                             address=args.address,
                             url=args.url,
                             language=args.lang,
                             countries=args.country,
                             cpc=args.cpc,
                             keywords=args.keywords,
                             content=contract_content)

        connection.session.add(contract)
        connection.session.flush()
        for txt in args.txt:
            contract_txt = ContractTexts(contract_id=contract.id,
                                         txt=txt)
            connection.session.add(contract_txt)

        resp = client.name_new('lnx:{}'.format(args.name), contract_content, args.days)
        if resp.get('error', False):
            return {
                'result_status': False,
                'message': format(resp['error']['message'])
            }, 400

        connection.session.commit()

        return {'result_status': True, 'result': 'Created'}

    @staticmethod
    def delete(name):
        contract = Contracts.query.filter(Contracts.user_id == current_user.id, Contracts.name == name).first()
        if not contract:
            abort(404)
        
        nvs_name = 'lnx:{0}'.format(contract.name)
        
        nvs_data = client.name_show(nvs_name)
        if not nvs_data.get('error', False) \
                and not nvs_data['result'].get('deleted', False) \
                and not nvs_data['result'].get('transferred', False):
            
            data = client.name_delete(nvs_name)
            if data.get('error', False):
                return {'result_status': False, 'message': data['error']['message']}, 400

        contract.txt.delete()
        connection.session.delete(contract)
        connection.session.commit()

        return {'result_status': True}


api.add_resource(EMCLNXAPI, '/emc_lnx', '/emc_lnx/<string:name>')
