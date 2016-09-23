'use strict';

emcwebApp.controller('SignController', ['$scope', '$rootScope', '$uibModal', 'Messages', 'Address',
                     function SignController($scope, $rootScope, $uibModal, Messages, Address) {
    $scope.message = {
        address: '',
        message: ''
    };

    $scope.verify = {
        address: '',
        message: '',
        signature: ''
    };

    $scope.sendMessage = function () {
        Messages.send($scope.message).$promise.then(function(data) {
            if (data.result_status) {
                $uibModal.open({
                    templateUrl: 'signedModal.html',
                    controller: 'SignedModalController',
                    size: 'lg',
                    resolve: {
                        signed: function () {
                            return data.result;
                        },
                        message: function () {
                            return $scope.message.message;
                        },
                        address: function () {
                            return $scope.message.address;
                        }
                    }
                });

                $scope.message.message = '';
                $scope.signForm.$setPristine();
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t sign message: ' + data.message});
            }
        });
    }

    $scope.verifyMessage = function() {
        Messages.verify($scope.verify).$promise.then(function(data) {
            if (data.result_status) {
                if (data.result) {
                    $rootScope.$broadcast('send_notify', {notify: 'success', message: 'This signature is valid'});
                } else {
                    $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'This signature is invalid'});
                }
                $scope.verify.message = '';
                $scope.verify.signature = '';
                $scope.verifyForm.$setPristine();
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t check signature'});
            }
        });
    }

    Address.get().$promise.then(function (data) {
        if (data.result_status) {
            $scope.addresses = data.result;
            $scope.message.address = $scope.addresses[0];
            $scope.verify.address = $scope.addresses[0];
        } else {
            $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t get addresses: ' + data.message});
        }
    });
}]);


emcwebApp.controller('SignedModalController', function SignedModalController($scope, $uibModalInstance, signed, message, address) {
    $scope.message = message;
    $scope.signed = signed;
    $scope.address = address;

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
