/**
 * Created by Rentala on 30-09-2016.
 */
/**
 * Created by Rentala on 30-09-2016.
 */
ebayApp.controller('cartController',['$scope', '$http', '$location',
    function($scope, $http, $location) {
    // create a message to display in our view
    $scope.message = 'Everyone come and see how good I look!';
    $scope.removeProduct = function (i) {
        $http({
            method: 'POST',
            url: '/shopping/api/removeProduct',
            data :JSON.stringify({ i : i})
        }).then(function (e) {
            if(e.data.result){
                $scope.cart = e.data.cart;
            } else{

            }
        }, function (e) {
            console.log(e);
        });
    };
    $scope.cart;
        $scope.addedProduct;
    $scope.hasItemsInCart = function () {
        return $scope.cart != undefined && $scope.cart.products != undefined && $scope.cart.products.length >0;
    }
    $scope.getCart = function () {
        $http({
            method: 'GET',
            url: '/shopping/api/shoppingcart'
        }).then(function (e) {
            if(e.data.result){
                $scope.cart = e.data.cart;
                var queryStrings = $location.search();
                if(queryStrings["m"] != undefined){
                    for(var i =0; i<$scope.cart.products.length; i++){
                        if(queryStrings["m"] == $scope.cart.products[i].productid){
                            $scope.addedProduct = $scope.cart.products[i];
                            break;
                        }
                    }
                    console.log($scope.addedProduct);
                }
            } else{

            }
        }, function (e) {
            console.log(e);
        });
    }
    $scope.getCart();
}]);