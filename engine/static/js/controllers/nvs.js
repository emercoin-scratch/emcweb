'use strict';

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
    $scope.nvs_item.days = 0;

    $scope.ok = function () {
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