'use strict';

emcwebApp.controller('EMCSSHController', ['$scope', '$rootScope', '$uibModal', 'EMCSSHUsers',
                     function EMCSSHController($scope, $rootScope, $uibModal, EMCSSHUsers) {

    $scope.delUser = function(idx) {
        var modalInstance = $uibModal.open({
            templateUrl: 'removeModal.html',
            controller: 'EMCSSHUserRemoveController',
            size: 'sm',
            resolve: {
                user: function () {
                    return $scope.users[idx].name;
                }
            }
        });

        modalInstance.result.then(
            function (selectedItem) {
                $scope.getUsers();
            }
        );
    }

    $scope.addUser = function () {
        var modalInstance = $uibModal.open({
            templateUrl: 'newModal.html',
            controller: 'EMCSSHUserNewController',
            resolve: {
                'users': function() {
                    return $scope.users;
                }
            }
        });

        modalInstance.result.then(
            function () {
                $scope.getUsers();
            }
        );
    };

    $scope.addLine = function(user_data) {
        user_data.push('');
    }

    $scope.delLine = function(user_data, idx) {
        user_data.splice(idx, 1);
    }

    $scope.saveUsers = function() {
        $scope.users = $scope.users.map(function(user_item){

            user_item.data = user_item.data.map(function(item){
                if (item.length > 0 && item[0] != '@') {
                    return '@' + item;
                }
                return item;
            });

            var uniqueNames = [];
            user_item.data.forEach(function(item) {
                if(uniqueNames.indexOf(item) === -1) {
                    uniqueNames.push(item);
                }
            });
            user_item.data = uniqueNames;

            user_item.data = user_item.data.filter(function(item) {
                return (item) ? true : false;
            });
            if (user_item.data.length == 0) {
                user_item.data.push('');
            }

            return user_item;
        });

        var i = 0;
        var max = $scope.users.length;
        $scope.users.forEach(function(item){
            var user_data = {
                name: item.name,
                data: item.data.join('\n')
            }
            EMCSSHUsers.save(user_data).$promise.then(function (data) {
                if (data.result_status) {
                    i++;
                    if (i == max) {
                        $rootScope.$broadcast('send_notify', {notify: 'success', message: 'All data has successfully been saved'});
                    }
                }
                $scope.getUsers();
            });
        });
    }

    $scope.getUsers = function() {
        $scope.users = [];
        EMCSSHUsers.get().$promise.then(function (data) {
            if (data.result_status) {
                var users = data.result;
                users.sort(function (a, b) {
                    if (a.name > b.name) {
                        return 1;
                    }
                    if (a.name < b.name) {
                        return -1;
                    }
                    return 0;
                });
                $scope.users = users;
            }
        });
    }

    $scope.getUsers();
}]);

emcwebApp.controller('EMCSSHUserRemoveController', function EMCSSHUserRemoveController($scope, $rootScope, $uibModalInstance, user, EMCSSHUsers) {
    $scope.user = user;

    $scope.ok = function () {
        $scope.removeIsDisabled = true;

        EMCSSHUsers.delete({name: $scope.user}).$promise.then(function (data) {
            if (data.result_status) {
                $rootScope.$broadcast('send_notify', {notify: 'success', message: 'User has successfully been deleted'});
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t add delete user: ' + data.message});
            }
            $uibModalInstance.close();
        });
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

emcwebApp.controller('EMCSSHUserNewController', function EMCSSHUserNewController($scope, $rootScope, $uibModalInstance, EMCSSHUsers, users) {
    $scope.user = {};
    $scope.users = users;

    $scope.ok = function () {
        $scope.addIsDisabled = true;
        
        if ($scope.user.data.length > 0 && $scope.user.data[0] != '@') {
            $scope.user.data = '@' + $scope.user.data;
        }

        var userdata = {
            name: $scope.user.name,
            data: $scope.user.data
        }
        $scope.users.forEach(function(item) {
            if (item.name == userdata.name) {
                var dataArr = item.data.slice();;
                dataArr.push($scope.user.data);

                var uniqueNames = [];
                dataArr.forEach(function(itemArr) {
                    if(uniqueNames.indexOf(itemArr) === -1) {
                        uniqueNames.push(itemArr);
                    }
                });
                userdata.data = uniqueNames.join('\n');
            }
        });
        EMCSSHUsers.save(userdata).$promise.then(function (data) {
            if (data.result_status) {
                $rootScope.$broadcast('send_notify', {notify: 'success', message: 'User has successfully been added'});
            } else {
                $rootScope.$broadcast('send_notify', {notify: 'danger', message: 'Can\'t add new user: ' + data.message});
            }
            $uibModalInstance.close();
        });
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
