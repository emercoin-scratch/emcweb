'use strict';


emcwebApp.controller('SSLVerifyController', ['$scope', '$rootScope', '$uibModal', 'EMCSSH', 'Encrypt',
                     function SSLVerifyController($scope, $rootScope, $uibModal, EMCSSH, Encrypt) {
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

        EMCSSH.save({data: $scope.config_data.join('\n')}).$promise.then(function(data) {
            if (data.result_status) {
                $rootScope.$broadcast('send_notify', {notify: 'success', message: 'All data has successfully been saved'});
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t save emcssh config: ' + data.message});
            }

            $scope.saveIsDisabled = false;
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
                //nope
            }
        );
    };
}]);


emcwebApp.controller('NewCertController', function NewCertController($scope, $rootScope, $uibModalInstance, $uibModal, Encrypt, Cert) {

    function makeCert(){
        $scope.newcert.common_name = ($scope.newcert.cn.length > 0 && $scope.newcert.cn[0] == '@') ? $scope.newcert.cn.slice(1) : $scope.newcert.cn
        Cert.create($scope.newcert).$promise.then(function (data) {
            if (data.result_status) {
                $uibModalInstance.close();
                $uibModal.open({
                    templateUrl: 'certsModal.html',
                    controller: 'CertsModalController',
                    resolve: {
                        data: function() {
                            return {
                                    cn: $scope.newcert.common_name,
                                    cert_name: data.result.name
                                    };
                        }
                    }
                });
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t create new certficate: ' + data.message});
            }
        });
    }

    $scope.newcert = {daystoexpire: 365, txt:[{name:'', value: ''}]};

    $scope.unlockWallet = function(status, callback){
        $uibModalInstance.close();
        var modalInstance = $uibModal.open({
            templateUrl: 'lockModal.html',
            controller: 'lockWalletController',
            resolve: {
                status: function () {
                    return status;
                }
            }
        });

        modalInstance.result.then(
            function (result) {
                callback();
            }
        );

    }

    $scope.makeCert = function () {
        $scope.okIsDisabled = true;
        
        Encrypt.status().$promise.then(function (data) {
            if (data.result_status) {
                if ([0, 3].indexOf(data.result)<0){
                    $scope.unlockWallet(data.result, makeCert);
                }else{
                    makeCert();
                }

            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t get wallet status: ' + data.message});
            }
            $scope.okIsDisabled = false;
        }, function(reason){
            $scope.okIsDisabled = false;
        });
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
    
    $scope.addTxt = function() {
        $scope.newcert.txt.push({name:'', value: ''});
    }

    $scope.delTxt = function(idx) {
        $scope.newcert.txt.splice(idx, 1);
    }

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
