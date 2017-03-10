'use strict';

emcwebApp.controller('WalletsController', ['$scope', '$window', 'Wallets', '$timeout', '$rootScope', '$uibModal', 'blockUI',
                     function WalletsController($scope, $window, Wallets, $timeout, $rootScope, $uibModal, blockUI) {
    $scope.choiceModal = function (filename) {
        var modalInstance = $uibModal.open({
            templateUrl: 'choiceWalletModal.html',
            controller: 'walletChoiceModalController',
            resolve: {
                wallet: function() {
                    return filename;
                }
            }
        });

        modalInstance.result.then(function (wallet) {
            blockUI.start('Restarting...');
            Wallets.choice({name: wallet}, null).$promise.then(function(data) {
                if (data.result_status) {
                    $rootScope.$broadcast('send_notify', {notify: 'success', message: 'The active wallet has been rotated'});
                } else {
                    $rootScope.$broadcast('send_notify', {notify: 'danger', message: data.message});
                }
                $scope.getWallets();
                $rootScope.$broadcast('update_wallet_status');
                blockUI.stop();
            }, function() {
                blockUI.stop();
            });
        });
    };

    $scope.deleteModal = function (filename) {
        var modalInstance = $uibModal.open({
            templateUrl: 'deleteWalletModal.html',
            controller: 'walletDeleteModalController',
            resolve: {
                wallet: function() {
                    return filename;
                }
            }
        });

        modalInstance.result.then(function () {
            $scope.getWallets();
        });
    };

    $scope.uploadModal = function (filename) {
        var modalInstance = $uibModal.open({
            templateUrl: 'uploadWalletModal.html',
            controller: 'walletUploadModalController',
            resolve: {}
        });

        modalInstance.result.then(function () {
            $scope.getWallets();
            $rootScope.$broadcast('send_notify', {notify: 'success', message: 'The wallet has been uploaded'});
        });
    };

    $scope.createModal = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'createWalletModal.html',
            controller: 'walletCreateModalController',
            resolve: {}
        });

        modalInstance.result.then(function (result) {
            $scope.getWallets();
            $rootScope.$broadcast('send_notify', {notify: 'success', message: result.message });
        });
    };

    $scope.getWallets = function() {
        Wallets.get().$promise.then(function (data) {
            if (data.result_status) {
                $scope.wallets = data.result;
            }
        });
    }

    $scope.makeBackup = function(backend) {
        var new_window = $window.open('/backup?engine=' + backend, 'OAuth','height=600,width=600');
        if ($window.focus) {
            new_window.focus();
        }
    }

    $scope.getWallets();
}]);


emcwebApp.controller('walletDeleteModalController', function walletDeleteModalController($scope, $uibModalInstance, $rootScope, Wallets, wallet) {
    $scope.wallet = wallet;

    $scope.deleteWallet = function() {
        $scope.deleteIsDisabled = true;

        Wallets.delete({name: $scope.wallet}).$promise.then(function(data){
            if (data.result_status) {
                $rootScope.$broadcast('send_notify', {notify: 'success', message: 'The wallet has been deleted'});
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: data.message});
            }
            $scope.deleteIsDisabled = false;
            $uibModalInstance.close();
        }, function(res){
            $scope.deleteIsDisabled = false;
        });
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});


emcwebApp.controller('walletChoiceModalController', function walletChoiceModalController($scope, $uibModalInstance, $rootScope, Wallets, wallet) {
    $scope.wallet = wallet;

    $scope.choiceWallet = function() {
        $uibModalInstance.close($scope.wallet);
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});


emcwebApp.controller('walletUploadModalController', function walletChoiceModalController($scope, $uibModalInstance, $rootScope, Upload) {
    $scope.uploader = function(file) {
        $scope.uploadIsDisabled = true;

        file.upload = Upload.upload({
            url: '/webapi/wallets',
            data: {filename: $scope.uploadName, file: file},
        });

        file.upload.then(function (response) {
            $scope.uploadIsDisabled = false;

            $uibModalInstance.close();
        }, function(res){
            $scope.uploadIsDisabled = false;
        });
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

emcwebApp.controller('walletCreateModalController', function ($scope, $uibModalInstance, $rootScope, Wallet) {
    $scope.creator = function() {
        $scope.makeIsDisabled = true;

        Wallet.create({'name': $scope.walletName}).$promise.then(function(data) {
            if (data.result_status && data.result) {
                
                $uibModalInstance.close(data);
                
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: data.message});
            }
            $scope.makeIsDisabled = false;
        }, function(res){
            $scope.makeIsDisabled = false;
        });       
    }

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

