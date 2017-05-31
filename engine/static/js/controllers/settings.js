'use strict';

emcwebApp.controller('SettingsController', ['$scope', '$rootScope', '$window', 'Settings', 'Password', '$uibModal', 'blockUI',
                     function SettingsController($scope, $rootScope, $window, Settings, Password, $uibModal, blockUI) {
    $scope.timeouts = [
        {'timeout': 3600, 'name': '1 hour'},
        {'timeout': 10800, 'name': '3 hours'},
        {'timeout': 43200, 'name': '12 hours'},
        {'timeout': 86400, 'name': '1 day'},
        {'timeout': 604800, 'name': '1 week'},
        {'timeout': 1209600, 'name': '2 weeks'},
        {'timeout': 2592000, 'name': '1 month'},
        {'timeout': 7776000, 'name': '3 months'},
        {'timeout': 15552000, 'name': '6 months'},
        {'timeout': 31536000, 'name': '1 year'}
    ];

    $scope.mail_connections = [
        {'value': 0, 'name': 'None'},
        {'value': 1, 'name': 'TLS'},
        {'value': 2, 'name': 'SSL'}
    ];

    $scope.timeout = null;
    $scope.smtp = {};
    $scope.old_settings = {};

    $scope.password = "";
    $scope.new_password = "";
    $scope.new_password2 = "";

    $scope.getSettings = function () {
        Settings.get().$promise.then(function(data) {
            $scope.old_settings = data;

            $scope.timeouts.forEach(function(item) {
                if (item.timeout == data.open_time) {
                    $scope.timeout = item;
                }
            });

            $scope.lc_api_key = data.lc_api_key || "";
            $scope.lc_secret_key = data.lc_secret_key || "";

            $scope.mail_connections.forEach(function(item) {
                if (item.value == data.smtp_connection) {
                    $scope.smtp.connection = item;
                }
            });

            $scope.smtp.enabled = data.smtp_enabled;
            $scope.smtp.host = data.smtp_host;
            $scope.smtp.port = data.smtp_port;
            $scope.smtp.email = data.smtp_email;

            $scope.smtp.auth = data.smtp_auth;
            $scope.smtp.username = data.smtp_username;
            $scope.smtp.password = data.smtp_password;
        });
    }

    $scope.applyTimeouts = function (timeout) {
        Settings.update({'open_time': timeout}).$promise.then(function() {
            $scope.getSettings();
            $rootScope.$broadcast('send_notify', {notify: 'success', message: 'Settings saved!'});
        });
    }

    $scope.applyLCSettings = function (api_key="", secret_key="") {
        $scope.isUpdateDisabled = true;

        Settings.update({
            'lc_api_key': api_key,
            'lc_secret_key': secret_key
        }).$promise.then(function(){
            $scope.isUpdateDisabled = false;
            $scope.getSettings();
            $rootScope.$broadcast('send_notify', {notify: 'success', message: 'Settings saved!'});
        }, function(reason) {
            $scope.isUpdateDisabled = false;
        });        
    }

    $scope.changePassword = function (password, new_password){
        $scope.isChangePasswordDisabled = true;
        Password.change({
            'password': password,
            'new_password': new_password
        }).$promise.then(function(result){
            $scope.isChangePasswordDisabled = false;
            if(result.result_status){
                $rootScope.$broadcast('send_notify', {notify: 'success', message: result.message});
                
                $window.setInterval(function(){ $window.location.href = '/auth/logout'; }, 3000);

            }else{
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: result.message});
            }
        }, function(reason) {
            $scope.isChangePasswordDisabled = false;
        })
    }

    $scope.applyMailerSettings = function (smtp) {
        Settings.update({
            'smtp_enabled': smtp.enabled,
            'smtp_host': smtp.host,
            'smtp_port': smtp.port,
            'smtp_email': smtp.email,
            'smtp_auth': smtp.auth,
            'smtp_username': smtp.username,
            'smtp_password': smtp.password,
            'smtp_connection': smtp.connection.value
        }).$promise.then(function(){
            $scope.getSettings();
            $rootScope.$broadcast('send_notify', {notify: 'success', message: 'Settings saved!'});
        });
    }

    $scope.checkSMTPChange = function (smtp, old_settings) {
        if (smtp.enabled != old_settings.smtp_enabled) {
            return false;
        }
        if (smtp.host != old_settings.smtp_host) {
            return false;
        }
        if (smtp.port != old_settings.smtp_port) {
            return false;
        }
        if (smtp.email != old_settings.smtp_email) {
            return false;
        }
        if (smtp.auth != old_settings.smtp_auth) {
            return false;
        }
        if (smtp.username != old_settings.smtp_username) {
            return false;
        }
        if (smtp.password != old_settings.smtp_password) {
            return false;
        }
        if (smtp.connection && smtp.connection.value != old_settings.smtp_connection) {
            return false;
        }

        return true;
    }

    $scope.restartServer = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'restartModal.html',
            controller: 'RestartServerController',
            resolve: {}
        });

        modalInstance.result.then(
            function () {
                blockUI.start('Restarting...');
                Settings.restart().$promise.then(function (data) {
                    blockUI.stop();
                    if (data.result_status) {
                        $rootScope.$broadcast('send_notify', {notify: 'success', message: 'Server has been restarted'});
                    }
                }, function() {
                    blockUI.stop();
                });
            }
        );
    };

    $scope.getSettings();
}]);


emcwebApp.controller('RestartServerController', function RestartServerController($scope, $uibModalInstance) {
    $scope.ok = function () {
        $uibModalInstance.close();
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
