/**
 * Created by Rentala on 30-09-2016.
 */
ebayApp.controller('homeController',  ['$scope', '$http', '$routeParams', '$location',
    function($scope, $http, $routeParams, $location) {
        $scope.category;
        $scope.products;
        $scope.selectedProducts = [];
        $scope.total;
        $scope.hasProducts = function () {
            return $scope.products != undefined && $scope.products.length >0;
        }
        $scope.hasSelectedProducts = function () {
            return $scope.selectedProducts != undefined && $scope.selectedProducts.length >0;
        }
        $scope.addToCart = function (i) {
            $http({
                method: 'POST',
                url: '/shopping/api/addproduct/',
                data: {i:i}
            }).then(function (e) {
                if(e.data.result){
                    $scope.selectedProducts = e.data.cart.products;
                    $scope.total = e.data.cart.total;
                } else{

                }
            }, function (e) {
                console.log(e);
            });
            logEvent("click " + $scope.$id, "add to cart called")
        }
        $scope.getProducts = function () {
            var url = $location.$$path, category = "Today's latest products";
            if($location.$$path == "/"){
                url = "/shopping/all/25"
            }
            $http({
                method: 'GET',
                url: url
            }).then(function (e) {
                if(e.data.result){
                    $scope.products = e.data.rows;
                    $scope.category = $location.$$path == "/" ? category :e.data.rows[0].category;
                    $scope.setProducts(e.data.rows);
                } else{

                }
            }, function (e) {
                console.log(e);
            });
            logEvent("pageload", "get products called")
        }
        $scope.getProducts();
        $scope.getSelectedProducts = function () {
            $http({
                method: 'GET',
                url: '/shopping/api/shoppingcart'
            }).then(function (e) {
                if(e.data.result){
                    $scope.selectedProducts = e.data.cart.products;
                    $scope.total = e.data.cart.total;


                } else{

                }
            }, function (e) {
                console.log(e);
            });
        }
        $scope.getProducts();
        $scope.getSelectedProducts();
        $scope.setProducts = function(prods){
            angular.forEach(prods, function (k,v) {
                k.forAuction = k.forAuction == 1 ? true: false;
                var expDate = new Date(k.validity);
                var currentTime = new Date();
                k.expiry =  expDate.getTime() < currentTime.getTime() ? "Expired on ": "Expires on ";
                k.expiry = k.expiry + expDate.toDateString() + " "+ expDate.toLocaleTimeString();
            });
        }
}]);

const categories = {
    Fashion: "/shopping/category/Fashion",
    Electronics: "/shopping/category/Electronics",
    SportingGoods: "/shopping/category/SportingGoods",
    Toys : "/shopping/category/Toys",
    Music: "/shopping/category/Music"
};