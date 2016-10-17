/**
 * Created by Rentala on 10-10-2016.
 */
/**
 * Created by Rentala on 30-09-2016.
 */
ebayApp.controller('confirmController',['$scope', '$http', '$location',
    function($scope, $http, $location) {
        // create a message to display in our view
        $scope.bidProduct;
        $scope.orderedProducts;
        $scope.orderid;
        $scope.getConfirmation = function () {
            $http({
                method: 'GET',
                url: '/shopping/api/confirmation'
            }).then(function (e) {
                if(e.data.result){
                    if(e.data.order){
                        $scope.orderedProducts = e.data.orders;
                        $scope.orderid = e.data.orderid;
                    }else{
                        $scope.bidProduct = e.data.bid;
                    }

                } else{
                    window.location.href = "/#/"
                }
            }, function (e) {
                window.location.href = "/#/"
                console.log(e);
            });
        }
        $scope.getConfirmation();
    }]);