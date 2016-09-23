'use strict';


emcwebApp.controller('SSLVerifyController', ['$scope', '$rootScope', '$uibModal', 'EMCSSH',
                     function SSLVerifyController($scope, $rootScope, $uibModal, EMCSSH) {
    $scope.addLine = function() {
        $scope.config_data.push('');
    }

    $scope.delLine = function(idx) {
        $scope.config_data.splice(idx, 1);
    }

    EMCSSH.get().$promise.then(function(data) {
        if (data.result_status) {
            $scope.config_data = data.result;
            if ($scope.config_data.length == 0) {
                $scope.config_data = [''];
            }
        } else {
            $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t get emcssh data: ' + data.message});
        }
    });

    $scope.saveConfig = function() {
        $scope.config_data = $scope.config_data.map(function(item){
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
            return (item) ? true : false;
        });
        if ($scope.config_data.length == 0) {
            $scope.config_data.push('');
        }

        EMCSSH.save({data: $scope.config_data.join('\n')}).$promise.then(function(data) {
            if (data.result_status) {
                $rootScope.$broadcast('send_notify', {notify: 'success', message: 'All data has successfully been saved'});
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t save emcssh config: ' + data.message});
            }
        });
    }

    $scope.newCertModal = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'newModal.html',
            controller: 'NewCertController',
            resolve: {}
        });

        modalInstance.result.then(
            function (result_data) {
                $uibModal.open({
                    templateUrl: 'certsModal.html',
                    controller: 'CertsModalController',
                    resolve: {
                        data: function() {
                            return result_data;
                        }
                    }
                });
            }
        );
    };
}]);


emcwebApp.controller('NewCertController', function NewCertController($scope, $rootScope, $uibModalInstance, Cert) {
    $scope.newcert = {}

    $scope.makeCert = function () {
        $scope.newcert.common_name = ($scope.newcert.cn.length > 0 && $scope.newcert.cn[0] == '@') ? $scope.newcert.cn.slice(1) : $scope.newcert.cn
        Cert.create($scope.newcert).$promise.then(function (data) {
            if (data.result_status) {
                $uibModalInstance.close({
                    cn: $scope.newcert.common_name,
                    cert_name: data.result.name
                });
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t create new certficate: ' + data.message});
            }
        });
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});


emcwebApp.controller('CertsModalController', function NewCertController($scope, $uibModalInstance, Cert, FileSaver, data) {
    $scope.data = data

    $scope.getCert = function(cert) {
        Cert.get({name: data.cert_name, bundle: cert}).$promise.then(function (blob_data) {
            FileSaver.saveAs(blob_data.content, data.cert_name + '.' + ((cert) ? 'zip' : 'p12'));
        });
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
