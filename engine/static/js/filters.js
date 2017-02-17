'use strict';

var filters = angular.module('emcwebFilters', [])

filters.filter('hasError', function() {
    return function (item) {
        return (item) ? 'has-error' : ''
    }
});

emcwebApp.filter('formatText',['$sce', function($sce){
    return function(text){

        var entityMap = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
        };
        var escapedText = String(text).replace(/[&<>"'\/]/g, function (s) {
                return entityMap[s];
            });

        return $sce.trustAsHtml(escapedText.replace(new RegExp('\\n','g'), "<br/>"));
    }
}]);