'use strict';

function _valueIsBinary(text){
    var unicodeWord = XRegExp('[\u0021-\u007E\u0400-\u04FF\u4E00-\u9FFF\uF900-\uFAFF]+')
    var chars = 0, len = text.length;

    for (var i=0; i<len; i++){
        if (unicodeWord.test(text[i])){
            chars = chars + 1;
        }
    }
    
    return !(chars >= len-1);
}

emcwebApp.controller('NVSController', ['$scope', '$rootScope', 'NVS', '$uibModal',
                     function NVSController($scope, $rootScope, NVS, $uibModal) {

    $scope.valueIsBinary = function(text){
        return _valueIsBinary(text);
    };

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
    function b64EncodeUnicode(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
    };

    $scope.nvs_item = nvs_item;
    $scope.nvs_item.days = 0;
    if (_valueIsBinary($scope.nvs_item.value)){
        $scope.nvs_item.tmpValue = b64EncodeUnicode($scope.nvs_item.value);
        $scope.nvs_item.typeOfData = "base64";
        $scope.nvs_item.valueIsBinary = true;
    }else{
        $scope.nvs_item.tmpValue = $scope.nvs_item.value;
        $scope.nvs_item.valueIsBinary = false;
    }

    $scope.ok = function () {
        $scope.nvs_item.value = $scope.nvs_item.tmpValue;
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
    $scope.nvs_item = {days: 300};

    $scope.ok = function () {
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