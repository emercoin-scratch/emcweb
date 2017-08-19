'use strict';


emcwebApp.controller('SSLVerifyController', ['$scope', '$rootScope', '$uibModal', 'EMERVPN',
                     function SSLVerifyController($scope, $rootScope, $uibModal, EMERVPN) {
    $scope.addLine = function() {
        $scope.config_data.push('');
    }

    $scope.delLine = function(idx) {
        $scope.config_data.splice(idx, 1);
    }

    EMERVPN.get().$promise.then(function(data) {
        if (data.result_status) {
            $scope.config_data = data.result;
            if ($scope.config_data.length == 0) {
                $scope.config_data = [''];
            }
        } else {
            $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t get emervpn data: ' + data.message});
        }
    });

    $scope.saveConfig = function() {
        $scope.saveIsDisabled = true;

        $scope.config_data = $scope.config_data.map(function(item){
            $scope.saveIsDisabled = false;

            if (item.length > 0 && item[0] != '@') {
                return '@' + item;
            }
            return item;
        });

        var uniqueNames = [];
        $scope.config_data.forEach(function(item) {
            if(uniqueNames.indexOf(item) === -1) {
                uniqueNames.push(item);
            }
        });
        $scope.config_data = uniqueNames;

        $scope.config_data = $scope.config_data.filter(function(item) {
            $scope.saveIsDisabled = false;

            return (item) ? true : false;
        });
        if ($scope.config_data.length == 0) {
            $scope.config_data.push('');
        }

        EMERVPN.save({data: $scope.config_data.join('\n')}).$promise.then(function(data) {
            if (data.result_status) {
                $rootScope.$broadcast('send_notify', {notify: 'success', message: 'All data has successfully been saved'});
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t save emervpn config: ' + data.message});
            }

            $scope.saveIsDisabled = false;
        });
    }

}]);

