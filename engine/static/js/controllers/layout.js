'use strict';

emcwebApp.controller('MessagesController', ['$scope', '$rootScope', '$compile',
                     function WalletsController($scope, $rootScope, $compile) {
    toastr.options = {
        closeButton: true,
        progressBar: true,
        showMethod: 'slideDown',
        timeOut: 10000
    };

    $scope.$on('send_notify', function(obj, msg) {
        switch(msg.notify) {
            case 'danger':
            case 'error':
                var expr = /^Error:\s(.*)$/gm;
                toastr.error(
                    (typeof(msg.message) == 'string') ? msg.message.replace(expr, '$1') : msg.message
                );
                break;
            case 'success':
                toastr.success(
                    msg.message
                );
                break;
            case 'warning':
                toastr.warning(
                    msg.message
                );
                break;
            default:
                toastr.info(
                    msg.message
                );
                break;
            }
    });
}]);


emcwebApp.controller('WalletStatusController', ['$scope', '$rootScope', '$uibModal', 'Encrypt',
                     function WalletsController($scope, $rootScope, $uibModal, Encrypt) {

    function getWalletStatus() {
        $scope.lock_class = '';
        Encrypt.status().$promise.then(function (data) {
            if (data.result_status) {
                $scope.status = data.result;
                switch($scope.status) {
                    case 0:
                        $scope.lock = 0;
                        $scope.lock_class = '';
                        break;
                    case 1:
                        $scope.lock = 1;
                        $scope.lock_class = 'fa-lock wallet_lock'
                        break;
                    case 2:
                        $scope.lock = 1;
                        $scope.lock_class = 'fa-unlock-alt wallet_mint'
                        break;
                    case 3:
                        $scope.lock = 1;
                        $scope.lock_class = 'fa-unlock-alt wallet_open'
                        break;
                }
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t get wallet status: ' + data.message});
            }
        });
    }

    $scope.$on('update_wallet_status', function() {
        getWalletStatus();
    });

    $scope.makeEncryptModal = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'makeEncryptModal.html',
            controller: 'makeEncryptController',
            resolve: {}
        });

        modalInstance.result.then(
            function (selectedItem) {
                $rootScope.$broadcast('update_wallet_status');
            }
        );
    };

    $scope.lockWalletModal = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'lockModal.html',
            controller: 'lockWalletController',
            resolve: {
                status: function() {
                    return $scope.status
                }
            }
        });

        modalInstance.result.then(
            function (selectedItem) {
                $rootScope.$broadcast('update_wallet_status');
            }
        );
    };

    getWalletStatus();
}]);


emcwebApp.controller('MenuController', ['$scope', '$rootScope',
                     function WalletsController($scope, $rootScope) {
}]);


emcwebApp.controller('makeEncryptController', function makeEncryptController($scope, $rootScope, $uibModalInstance, Encrypt) {
    $scope.disable_btn = false;
    $scope.form_confirm = false;

    $scope.encrypt = function() {
        $scope.form_confirm = true;
    }

    $scope.confirmed = function () {
        if ($scope.wallet_pass != $scope.wallet_pass_re) {
            $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Passwords not match'});
            $uibModalInstance.dismiss('cancel');
        } else {
            $scope.disable_btn = true;
            Encrypt.encrypt({'pass': $scope.wallet_pass}).$promise.then(function(){
                $rootScope.$broadcast('update_wallet_status');
                $rootScope.$broadcast('send_notify', {notify: 'success', message: 'Wallet has been encrypted'});
                $uibModalInstance.close();
            }, function() {
                $uibModalInstance.close();
            });
            $uibModalInstance.close();
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});


emcwebApp.controller('lockWalletController', function lockWalletController($scope, $rootScope, $uibModalInstance, Encrypt, status) {
    $scope.status = status;

    $scope.fineResult = function(msg) {
        $rootScope.$broadcast('send_notify', {notify: 'success', message: msg});
        $uibModalInstance.close();
    }

    $scope.openWallet = function (mode) {
        Encrypt.open({'passphrase': $scope.wallet_pass}).$promise.then(function (data) {
            $scope.fineResult('The wallet has been unlocked');
        }, function() {
            $uibModalInstance.close();
        });
    }

    $scope.mintWallet = function (mode) {
        Encrypt.mint({'passphrase': $scope.wallet_pass}).$promise.then(function (data) {
            $scope.fineResult('The wallet has been opened for minting only');
        }, function() {
            $uibModalInstance.close();
        });
    }

    $scope.closeWallet = function () {
        Encrypt.close().$promise.then(function (data) {
            $scope.fineResult('The wallet has been locked');
        }, function() {
            $uibModalInstance.close();
        });
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});