/**
 * Created by Rentala on 22-09-2016.
 */

    var app = angular.module('calculator', [])
        .controller('calcController', ['$scope', '$http', function($scope, $http){
            $scope.firstIp = true, $scope.params = [],$scope.operators = [],$scope.paramsIndex = 0,$scope.operator = "";
            $scope.input = function (i) {
                if($scope.params[$scope.paramsIndex] == undefined)
                    $scope.params[$scope.paramsIndex] =0;
                $scope.params[$scope.paramsIndex] = $scope.params[$scope.paramsIndex]*10 + i;
            }

            $scope.operation = function(op){
                $scope.operators.push(op);
                $scope.paramsIndex++;
            }
            $scope.clear = function(){
                $scope.params = [];
                $scope.operators = [];
                $scope.paramsIndex = 0;
            }
            $scope.evaluate = function () {
                $http({
                    method: 'POST',
                    url: '/calculate',
                    data: JSON.stringify({
                        operators: $scope.operators,
                        params : $scope.params
                    })}).then(function (e) {
                    $scope.clear();
                    if(e.data.result){
                        $scope.params.push(e.data.total)
                    } else{
                        $scope.params.push(e.data.message)
                    }
                }, function (e) {
                    console.log(e);
                })
            }
            $scope.total = 0;
        }]);