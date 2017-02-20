'use strict';

var filters = angular.module('emcwebFilters', [])

filters.filter('hasError', function() {
    return function (item) {
        return (item) ? 'has-error' : ''
    }
});
 
emcwebApp.filter('formatText',['$sce', function($sce){
    return function(text, scope){
        if (scope.valueIsBinary(text)){
            return $sce.trustAsHtml("&lt;Binary data&gt;")
        }
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
