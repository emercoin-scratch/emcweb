'use strict';

var emcwebServices = angular.module('emcwebServices', []);

emcwebServices.factory('errorInterceptor', ['$q', '$rootScope', function ($q, $rootScope) {
    return {
        response: function (response) {

            return response;
        },
        responseError: function (response) {
            if (response.status != "200") {
                if (response.status == "500") {
                    if (response.data['message']) {
                        $rootScope.$broadcast('send_notify', {notify: 'danger', message: response.data['message']});
                    } else {
                        $rootScope.$broadcast('send_notify', {notify: 'danger', message: response.data});
                    }
                } else if (response.status == "401" || response.status == "403") {
                    window.location.reload();
                } else if (response.status == "400") {
                    if (response.data['message']) {
                        $rootScope.$broadcast('send_notify', {notify: 'danger', message: response.data['message']});
                    } else {
                        $rootScope.$broadcast('send_notify', {notify: 'danger', message: response.data});
                    }
                } else {
                    $rootScope.$broadcast('send_notify', {notify: 'danger', message: response.data});
                }
            }
            return $q.reject(response);
        }
    };
}]);
