'use strict';

emcwebApp.controller('WalletController', ['$cookies', '$scope', '$rootScope', '$uibModal', 'Balance', 'Transactions', 'LiveCoin', 'NVS', 'Encrypt',
                     function WalletController($cookies, $scope, $rootScope, $uibModal, Balance, Transactions, LiveCoin, NVS, Encrypt) {

    $scope.unlockWalletModalAndPay = function (status, trans) {
        var modalInstance = $uibModal.open({
            templateUrl: 'lockModal.html',
            controller: 'lockWalletController',
            resolve: {
                status: function() {
                    return status
                },
                createTrans: function() {
                    return trans
                }
            }
        });

        modalInstance.result.then(
            function (result=false) {
                if (result){
                    $scope.pay();
                    $rootScope.$broadcast('update_wallet_status');
                }
            }
        );
    };

    $scope.pay = function(){
        Transactions.create({ address: $scope.form_address, amount: $scope.form_amount }).$promise.then(function (data) {
            if (data.result_status) {
                $rootScope.$broadcast('send_notify', {notify: 'success', message: 'Your payment has been accepted'});
                $scope.getTransactions();
                $scope.form_address = "";
                $scope.form_amount = "";
                $scope.transferForm.$setPristine();
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Your payment has been declined'});
            }
        });
    };

    $scope.makeTransfer = function () {
        Encrypt.status().$promise.then(function (data) {
            if (data.result_status) {
                var status = data.result;
                if (status != 3){
                    $scope.unlockWalletModalAndPay(status, true);
                }else{
                    $scope.pay();
                }

            }else{
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t get wallet status: ' + data.message});
            }
        });
    };



    $scope.getBalance = function() {
        Balance.get().$promise.then(function (data) {
            if (data.result_status) {
                $scope.balance = data.result;
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t get balance: ' + data.message});
            }
        });
    }

    $scope.getTransactions = function() {
        Transactions.get().$promise.then(function (data) {
            if (data.result_status) {
                $scope.transactions = data.result;
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t get transactions: ' + data.message});
            }
        });
    }


    $scope.openModal = function (action) {
        var modalInstance = $uibModal.open({
            templateUrl: 'liveCoinModal.html',
            controller: 'LiveCoinController',
            resolve: {
                operation: function () {
                    return action;
                }
            }
        });

        modalInstance.result.then(
            function (selectedItem) {
                LiveCoin.get().$promise.then(function (data) {
                    if (data.result_status) {
                        $scope.live_coin = data.result;
                    }
                });
                $scope.getBalance();
            }
        );
    };

    $scope.getNVSExpired = function() {
        NVS.getExpires().$promise.then(function (data) {
            if (data.result_status) {
                var countExpired = data.result.length
                if (countExpired > 0){
                    $rootScope.$broadcast('send_notify', {notify: 'warning', message: 'Warning: You have ' + countExpired + ' NVS records which will soon expire'});
                }
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t get count expires names: ' + data.message});
            }
        });
    }

    $scope.form_address = "";
    $scope.form_amount = "";
    $scope.lc_setting = false;

    LiveCoin.get().$promise.then(function (data) {
        if (data.result_status) {
            $scope.live_coin = data.result;
        } else {
            $scope.lc_setting = true;
        }
    }, function () {
        $scope.lc_setting = true;
    });

    $scope.getTransactions();
    $scope.getBalance();

    if ($cookies.get('strict_get_expires_nvs') == 1){
        $scope.getNVSExpired();
        $cookies.put('strict_get_expires_nvs', 0);
    }
}]);


emcwebApp.controller('LiveCoinController', function LiveCoinController($scope, $rootScope, $uibModalInstance, operation, LiveCoin) {
    if (operation == 'send') {
        $scope.operation_title = 'Send to LiveCoin';
        $scope.btn_name = 'Send';
        $scope.minimal_value = 0.01;
        $scope.amount = '';
    } else {
        $scope.operation_title = 'Receive from LiveCoin';
        $scope.btn_name = 'Request';
        $scope.minimal_value = 0.1;
        $scope.amount = '';
    }

    $scope.ok = function () {
        if (operation == 'send') {
            LiveCoin.send({amount: $scope.amount}).$promise.then(function (data) {
                if (data.result_status) {
                    $rootScope.$broadcast('send_notify', {notify: 'success', message: 'Your amount has been accepted for sending'});
                } else {
                    $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Send problem: ' + data.message});
                }
                $uibModalInstance.close();
            }, function() {
                $uibModalInstance.close();
            });
        } else {
            LiveCoin.receive({amount: $scope.amount}).$promise.then(function (data) {
                if (data.result_status) {
                    $rootScope.$broadcast('send_notify', {notify: 'success', message: 'Your amount has been accepted for receiving'});
                } else {
                    $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Receive problem: ' + data.message});
                }
                $uibModalInstance.close();
            }, function() {
                $uibModalInstance.close();
            });
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});