# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import ujson

from . import module_bp
from emcweb.emcweb.utils import get_block_status


@module_bp.route('blocks')
def blocks():
    status, blocks = get_block_status()
    return ujson.dumps({'status': status, 'blocks': blocks})
