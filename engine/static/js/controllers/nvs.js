'use strict';

function b64Encode(str) {
        return btoa(str);
        // return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        //     return String.fromCharCode('0x' + p1);
        // }));
    };

function b64Decode(str) {
    return atob(str);
    // return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
    //     return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    // }).join(''));
}

function decodeValue(val, old_type, new_type){
    var result = val;
    if (old_type == 'utf8' && new_type == 'base64'){
        result = b64Encode(result);
    }else if(old_type == 'base64' && new_type == 'utf8'){
        result = b64Decode(result);
    };
    return result;
}



emcwebApp.controller('NVSController', ['$scope', '$rootScope', 'NVS', '$uibModal', 'Encrypt',
                     function NVSController($scope, $rootScope, NVS, $uibModal, Encrypt) {

    $scope.getWalletStatus = function(){
        Encrypt.status().$promise.then(function (data) {
            if (data.result_status) {
                $scope.status = data.result;
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t get wallet status: ' + data.message});
            }
        });
    }

    $scope.get_nvs = function() {
        NVS.get().$promise.then(function (data) {

            if (data.result_status) {
                
                var patternInfocard = /^info:[0-9a-fA-F]{16}$/;
                var patternSSL = /^ssl:[0-9a-fA-F]{16}$/;
                for (var i=0; i<data.result.length; i++){

                    if (patternInfocard.test(data.result[i].name)){
                        data.result[i].isInfocard = true;
                    }
                    if (patternSSL.test(data.result[i].name)){
                        data.result[i].isSSL = true;
                    }

                    data.result[i].value = decodeValue(data.result[i].value, 'base64', 'utf8');
                }

                $scope.nvs_list = data.result;

            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: data.message});
            }
        });
    }

    $scope.unlockWallet = function(status, callback){
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

    $scope.removeName = function (item) {

        function remove(){
            NVS.remove({name:item.name}).$promise.then(function (data) {
                if (data.result_status) {
                    $rootScope.$broadcast('send_notify', {notify: 'success', message: 'Your entry has been deleted'});
                    $scope.get_nvs();
                }
            });
        }

        var modalInstance = $uibModal.open({
            templateUrl: 'removeModal.html',
            controller: 'NVSRemoveController',
            resolve: {
                nvs_item: function () {
                    return item;
                }
            }
        });

        modalInstance.result.then(
            function (selectedItem) {
                Encrypt.status().$promise.then(function (data) {
                    if (data.result_status) {
                        if (data.result != 3){
                            $scope.unlockWallet(data.result, remove);
                        }else{
                            remove();
                        }

                    } else {
                        $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t get wallet status: ' + data.message});
                    }
                });
            }
        );
    };

    $scope.editModal = function (item) {
        var modalInstance = $uibModal.open({
            templateUrl: 'editModal.html',
            controller: 'NVSEditController',
            resolve: {
                nvs_item: function () {
                    return item;
                }
            }
        });

        modalInstance.result.then(
            function (selectedItem) {
                $scope.get_nvs();
            }
        );
    };

    $scope.newModal = function (item) {
        var modalInstance = $uibModal.open({
            templateUrl: 'newModal.html',
            controller: 'NVSNewController',
            resolve: {}
        });

        modalInstance.result.then(
            function (selectedItem) {
                $scope.get_nvs();
            }
        );
    };

    $scope.reNewModal = function (item) {
        if (!item.isSSL){
            return;
        }
        
        var modalInstance = $uibModal.open({
            templateUrl: 'reNewCert.html',
            controller: 'reNewCertController',
            resolve: {
                nvs_item: function () {
                    return item;
                },
                common_name: function(){
                    var name = item['name'].substring(4);
                    for (var i = 0; i < $scope.nvs_list.length; i++){
                        if(name == $scope.nvs_list[i]['value']){
                            return $scope.nvs_list[i]['name'].substring(4);
                        }
                    }
                    return ""

                }
            }
        });

        modalInstance.result.then(
            function (selectedItem) {
                $scope.get_nvs();
            }
        );
    };

    $scope.getWalletStatus();
    $scope.get_nvs();
}]);



emcwebApp.controller('NVSRemoveController', function NVSRemoveController($scope, $rootScope, $uibModalInstance, Encrypt, nvs_item) {
    $scope.nvs_item = nvs_item;

    $scope.ok = function () {
        $uibModalInstance.close();
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

});


emcwebApp.controller('NVSEditController', function NVSEditController($scope, $rootScope, $uibModalInstance, $uibModal, Encrypt, nvs_item, NVS) {

    function ok(){
        if ($scope.nvs_item.typeOfData != 'base64'){
            $scope.nvs_item.value = $scope.decodeValue($scope.nvs_item.tmpValue, $scope.nvs_item.typeOfData, 'base64');
            $scope.nvs_item.typeOfData = 'base64';
        }else{
            $scope.nvs_item.value = $scope.nvs_item.tmpValue;
        }

        NVS.update($scope.nvs_item).$promise.then(function (data) {
            $rootScope.$broadcast('send_notify', {notify: 'success', message: 'Your entry has been updated'});
            $uibModalInstance.close();
        }, function(httpResponse) {
            $uibModalInstance.close();
        });
    }

    $scope.nvs_item = nvs_item;
    $scope.nvs_item.typeOfData = 'utf8';
    $scope.old_type = $scope.nvs_item.typeOfData;
    $scope.nvs_item.days = 0;
    
    $scope.nvs_item.tmpValue = $scope.nvs_item.value;

    $scope.decodeValue = decodeValue;

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

    $scope.newValue = function(){
        $scope.nvs_item.tmpValue = $scope.decodeValue($scope.nvs_item.tmpValue || "", $scope.old_type, $scope.nvs_item.typeOfData);
        $scope.old_type = $scope.nvs_item.typeOfData;
    }

    $scope.ok = function () {
        Encrypt.status().$promise.then(function (data) {
            if (data.result_status) {
                if (data.result != 3){
                    $scope.unlockWallet(data.result, ok);
                }else{
                    ok();
                }

            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t get wallet status: ' + data.message});
            }
        });
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});


emcwebApp.controller('NVSNewController', function NVSNewController($scope, $rootScope, $uibModalInstance, $uibModal, Encrypt, NVS) {

    function ok(){
        if ($scope.nvs_item.typeOfData != 'base64'){
            $scope.nvs_item.value = $scope.decodeValue($scope.nvs_item.tmpValue, $scope.nvs_item.typeOfData, 'base64');
            $scope.nvs_item.typeOfData = 'base64';
        }else{
            $scope.nvs_item.value = $scope.nvs_item.tmpValue;
        }
        NVS.create($scope.nvs_item).$promise.then(function (data) {
            $rootScope.$broadcast('send_notify', {notify: 'success', message: 'Your entry has been saved'});
            $uibModalInstance.close();
        }, function(httpResponse) {
            $uibModalInstance.close();
        });
    }

    $scope.nvs_item = {days: 300, typeOfData: "utf8"};
    $scope.old_type = "utf8"
    $scope.decodeValue = decodeValue;

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

    $scope.newValue = function(){
        $scope.nvs_item.tmpValue = $scope.decodeValue($scope.nvs_item.tmpValue || "", $scope.old_type, $scope.nvs_item.typeOfData);
        $scope.old_type = $scope.nvs_item.typeOfData;
    }

    $scope.ok = function () {
        Encrypt.status().$promise.then(function (data) {
            if (data.result_status) {
                if (data.result != 3){
                    $scope.unlockWallet(data.result, ok);
                }else{
                    ok();
                }

            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t get wallet status: ' + data.message});
            }
        });
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});


emcwebApp.controller('reNewCertController', function NewCertController($scope, $rootScope, $uibModalInstance, $uibModal, Encrypt, Cert, nvs_item, common_name) {

    function makeCert(){
        $scope.newcert.common_name = ($scope.newcert.cn.length > 0 && $scope.newcert.cn[0] == '@') ? $scope.newcert.cn.slice(1) : $scope.newcert.cn
        $scope.newcert.name = nvs_item.name.replace('ssl:', '');
        Cert.reNew($scope.newcert).$promise.then(function (data) {
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

    $scope.newcert = {daystoexpire: 365, cn: common_name, txt:[{name:'', value: ''}]};

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
        Encrypt.status().$promise.then(function (data) {
            if (data.result_status) {
                if (data.result != 3){
                    $scope.unlockWallet(data.result, makeCert);
                }else{
                    makeCert();
                }

            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t get wallet status: ' + data.message});
            }
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
