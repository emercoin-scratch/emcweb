'use strict';

var filters = angular.module('emcwebFilters', [])

filters.filter('hasError', function() {
    return function (item) {
        return (item) ? 'has-error' : ''
    }
});
