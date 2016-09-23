'use strict';

emcwebApp.controller('InfoController', ['$scope', '$rootScope', 'Info',
                     function InfoController($scope, $rootScope, Info) {
    Info.get().$promise.then(function(data) {
        if (data.result_status) {
            $scope.info = data.result;
        } else {
            $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t get information: ' + data.message});
        }
    });
}]);
