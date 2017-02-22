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

emcwebApp.controller('NVSController', ['$scope', '$rootScope', 'NVS', '$uibModal',
                     function NVSController($scope, $rootScope, NVS, $uibModal) {

    $scope.get_nvs = function() {
        NVS.get().$promise.then(function (data) {

            if (data.result_status) {
                
                $scope.nvs_list = data.result;

            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: data.message});
            }
        });
    }

    $scope.removeName = function (item) {
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
                NVS.remove({name:item.name}).$promise.then(function (data) {
                    if (data.result_status) {
                        $rootScope.$broadcast('send_notify', {notify: 'success', message: 'Your entry has been deleted'});
                        $scope.get_nvs();
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


    $scope.get_nvs();
}]);


emcwebApp.controller('NVSEditController', function NVSEditController($scope, $rootScope, $uibModalInstance, nvs_item, NVS) {

    $scope.nvs_item = nvs_item;
    $scope.nvs_item.typeOfData = 'utf8';
    $scope.old_type = $scope.nvs_item.typeOfData;
    $scope.nvs_item.days = 0;

    $scope.nvs_item.tmpValue = b64Decode($scope.nvs_item.value);

    $scope.decodeValue = decodeValue;

    $scope.newValue = function(){
        $scope.nvs_item.tmpValue = $scope.decodeValue($scope.nvs_item.tmpValue, $scope.old_type, $scope.nvs_item.typeOfData);
        $scope.old_type = $scope.nvs_item.typeOfData;
    }

    $scope.ok = function () {
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
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});


emcwebApp.controller('NVSRemoveController', function NVSRemoveController($scope, $uibModalInstance, nvs_item) {
    $scope.nvs_item = nvs_item;

    $scope.ok = function () {
        $uibModalInstance.close();
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});


emcwebApp.controller('NVSNewController', function NVSNewController($scope, $rootScope, $uibModalInstance, NVS) {
    $scope.nvs_item = {days: 300, typeOfData: "utf8"};
    $scope.old_type = "utf8"
    $scope.decodeValue = decodeValue;

    $scope.newValue = function(){
        $scope.nvs_item.tmpValue = $scope.decodeValue($scope.nvs_item.tmpValue, $scope.old_type, $scope.nvs_item.typeOfData);
        $scope.old_type = $scope.nvs_item.typeOfData;
    }

    $scope.ok = function () {
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
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});