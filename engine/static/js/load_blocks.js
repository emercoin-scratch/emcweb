'use strict';

var emcwebApp = angular.module('emcwebApp', [
    'ngResource',
    'ui.bootstrap'
]);

emcwebApp.config(['$interpolateProvider', function($interpolateProvider) {
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
}]);

emcwebApp.factory('Blocks', function($resource) {
    return $resource('/blocks', null,
        {
            'get': {method: 'GET'}
        });
});

emcwebApp.controller('BlockController', ['$scope', '$window', '$interval', '$timeout', 'Blocks',
                     function InfoController($scope, $window, $interval, $timeout, Blocks) {

    $scope.blocks = 0;
    $scope.percent = 0;
    $scope.all_blocks = 180577 + parseInt((Date.now() - 1470268800000) / 86000000 * 200);

    $scope.getBlocks = function() {
        Blocks.get().$promise.then(function (data) {
            $scope.status = data.status;
            $scope.blocks = (data.blocks == null) ? 0 : data.blocks;
            if ($scope.status == 2) {
                $window.location.reload();
            }

            var tmp_pr = Math.round($scope.blocks / ($scope.all_blocks / 100));
            $scope.percent = (tmp_pr > 100) ? 100 : tmp_pr;
        });
    }

    $scope.getBlocks();
    $scope.checker = $interval($scope.getBlocks, 10000)
}]);
