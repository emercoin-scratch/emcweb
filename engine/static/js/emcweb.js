'use strict';

var emcwebApp = angular.module('emcwebApp', [
    'emcwebResource',
    'emcwebServices',
    'emcwebFilters',
    'ngFileUpload',
    'ngFileSaver',
    'angular-loading-bar',
    'angular.filter',
    'ui.bootstrap',
    'monospaced.qrcode',
    'ui.select',
    'ngSanitize',
    'rt.select2',
    'blockUI'
]);

emcwebApp.config(['$interpolateProvider', function($interpolateProvider) {
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
}]);

emcwebApp.config(function ($httpProvider) {
    $httpProvider.defaults.headers.post.dataType = 'json';
    $httpProvider.interceptors.push('errorInterceptor');
});

angular.module('emcwebApp').config(function(blockUIConfig) {
    blockUIConfig.autoBlock = false;
});