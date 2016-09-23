'use strict';

emcwebApp.controller('ReceiveController', ['$scope', '$rootScope', '$uibModal', 'Address',
                     function ReceiveController($scope, $rootScope, $uibModal, Address) {

    $scope.getAddresses = function() {
        Address.get().$promise.then(function (data) {
            if (data.result_status) {
                $scope.addresses = data.result.map(function(item) {
                    if ($scope.old_addresses) {
                        var class_i = ($scope.old_addresses.indexOf(item) > -1) ? '' : 'warning';
                    } else {
                        var class_i = '';
                    }

                    return {
                        address: item,
                        class: class_i
                    }
                });
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t get addresses: ' + data.message});
            }
        });
    }

    $scope.newAddress = function () {
        Address.create().$promise.then(function (data) {
            if (data.result_status) {
                $scope.old_addresses = $scope.addresses.map(function(item) {
                    return item.address;
                });
                $scope.getAddresses();
                $rootScope.$broadcast('send_notify', {notify: 'success', message: 'Your new address is ' + data.result});
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t create new address: ' + data.message});
            }
        });
    }

    $scope.openQRCode = function (address) {
        $uibModal.open({
            templateUrl: 'qrcodeModal.html',
            controller: 'qrCodeController',
            resolve: {
                address: function () {
                    return address.address;
                }
            }
        });
    };

    $scope.openEmail = function (address) {
        $uibModal.open({
            templateUrl: 'emailModal.html',
            controller: 'emailController',
            resolve: {
                address: function () {
                    return address.address;
                }
            }
        });
    };

    $scope.getAddresses();
}]);


emcwebApp.controller('qrCodeController', function NVSRemoveController($scope, $window, $uibModalInstance, address) {
    $scope.qrcode_data = '';
    $scope.data = {};
    $scope.address = address;
    $scope.versions = {
        3: 43,
        4: 63,
        5: 85,
        6: 107,
        7: 123,
        8: 153,
        9: 181,
        10: 214
    }

    $scope.getVersion = function(length) {
        for (var i = 1; i <=10; i++) {
            if ($scope.qrcode_data.length < $scope.versions[i]) {
                return i;
            }
        }

        return 15;
    }

    $scope.$watch('data', function() {
        $scope.qrcode_data = 'emercoin:' + $scope.address
        var params = [];
        if ($scope.data.amount) {
            params.push('amount=' + $scope.data.amount);
        }
        if ($scope.data.message) {
            params.push('message=' + $scope.data.message);
        }
        if (params.length > 0) {
            $scope.qrcode_data += '?' + params.join('&');
        }
    }, true);

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.qrcode_width = ($window.innerWidth >= 350) ? 250 : $window.innerWidth - 100;
    angular.element($window).bind('resize', function(){
         $scope.qrcode_width = ($window.innerWidth >= 350) ? 250 : $window.innerWidth - 100;
         $scope.$digest();
    });
});

emcwebApp.controller('emailController', function emailController($scope, $uibModalInstance, $rootScope, address, Email) {
    $scope.data = {};
    $scope.address = address;

    $scope.send = function() {
        Email.send({
            'address': $scope.address,
            'message': $scope.data.message,
            'email': $scope.data.email,
            'amount': $scope.data.amount
        }).$promise.then(function (data) {
            if (data.result_status) {
                $rootScope.$broadcast('send_notify', {notify: 'success', message: 'Your request has been sent'});
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t send email: ' + data.message});
            }
        });
        $uibModalInstance.close();
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});