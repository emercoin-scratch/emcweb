'use strict';

var emcwebResource = angular.module('emcwebResource', ['ngResource']);

emcwebResource.factory('Wallets', function($resource) {
    return $resource('/webapi/wallets/:name', null,
        {
            'get': {method: 'GET'},
            'choice': {method: 'PUT'},
            'delete': {method: 'DELETE'}
        });
});

emcwebResource.factory('Wallet', function($resource) {
    return $resource('/webapi/wallet/:name', null,
        {
            'create': {method: 'POST'}
        });
});

emcwebResource.factory('Encrypt', function($resource) {
    return $resource('/webapi/encrypt', null,
        {
            'status': {method: 'GET'},
            'encrypt': {method: 'PUT'},
            'open': {method: 'POST'},
            'mint': {method: 'POST' , params: {mintonly: 1}},
            'close': {method: 'DELETE'}
        });
});

emcwebResource.factory('Blocks', function($resource) {
    return $resource('/webapi/blocks', null,
        {
            'status': {method: 'GET'}
        });
});

emcwebResource.factory('Info', function($resource) {
    return $resource('/webapi/info', null,
        {
            'get': {method: 'GET'}
        });
});

emcwebResource.factory('Address', function($resource) {
    return $resource('/webapi/address', null,
        {
            'get': {method: 'GET'},
            'create': {method: 'POST'}
        });
});

emcwebResource.factory('Balance', function($resource) {
    return $resource('/webapi/balance', null,
        {
            'get': {method: 'GET'}
        });
});

emcwebResource.factory('Transactions', function($resource) {
    return $resource('/webapi/transactions', null,
        {
            'get': {method: 'GET'},
            'create': {method: 'POST'}
        });
});

emcwebResource.factory('Settings', function($resource) {
    return $resource('/webapi/settings', null,
        {
            'get': {method: 'GET'},
            'update': {method: 'POST'},
            'restart': {method: 'PUT'}
        });
});

emcwebResource.factory('Messages', function($resource) {
    return $resource('/webapi/messages', null,
        {
            'verify': {method: 'GET'},
            'send': {method: 'POST'}
        });
});

emcwebResource.factory('Cert', function($resource, Blob) {
    return $resource('/webapi/certs/:name', null,
        {
            'get': {
                method: 'GET',
                cache: false,
                responseType: 'arraybuffer',
                transformResponse: function(data) {
                    return {content: new Blob([data])};
                }
            },
            'create': {method: 'POST'}
        });
});

emcwebResource.factory('NVS', function($resource) {
    return $resource('/webapi/nvs', null,
        {
            'get': {method: 'GET'},
            'update': {method: 'PUT'},
            'create': {method: 'POST'},
            'remove': {method: 'DELETE'}
        });
});

emcwebResource.factory('BackupList', function($resource) {
    return $resource('/webapi/backup_list', null,
        {
            'get': {method: 'GET'}
        });
});

emcwebResource.factory('LiveCoin', function($resource) {
    return $resource('/webapi/live_coin', null,
        {
            'get': {method: 'GET'},
            'send': {method: 'POST'},
            'receive': {method: 'PUT'}
        });
});

emcwebResource.factory('Email', function($resource) {
    return $resource('/webapi/email', null,
        {
            'send': {method: 'POST'}
        });
});

emcwebResource.factory('EMCSSH', function($resource) {
    return $resource('/webapi/emc_ssh', null,
        {
            'get': {method: 'GET'},
            'save': {method: 'POST'}
        });
});

emcwebResource.factory('EMCLNX', function($resource, Blob) {
    return $resource('/webapi/emc_lnx/:name', null,
        {
            /*'get': {
                method: 'GET',
                cache: false,
                responseType: 'arraybuffer',
                transformResponse: function(data) {
                    return {content: new Blob([data])};
                }
            },*/
            'get': {method: 'GET'},
            'create': {method: 'POST'},
            'del': {method: 'DELETE'},
        });
});

emcwebResource.factory('EMCSSHUsers', function($resource) {
    return $resource('/webapi/emc_ssh_users', null,
        {
            'get':  {method: 'GET'},
            'save': {method: 'POST'},
            'delete': {method: 'DELETE'}
        });
});
