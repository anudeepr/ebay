/**
 * Created by Rentala on 03-10-2016.
 */

/**
 * Created by Rentala on 30-09-2016.
 */

const categories = {
    Fashion: "Fashion",
    Electronics: "Electronics",
    SportingGoods: "Sporting Goods",
    Toys : "Toys",
    Music: "Music"
};
const productConditions = {
    NewWithBox: "New with Box",
    NewWithoutBox: "New without Box",
    PreOwned: "Pre-owned"
};
const subCategories ={
    Fashion: {
        Shoes : "Shoes",
        Watches : "Watches",
        Clothing : "Clothing"
    },
    Electronics:{
        Laptops : "Laptops",
        MobilePhones : "Mobile Phones",
        Headphones: "Head Phones"
    },
    SportingGoods : {
        Baseball : "Baseball",
        Gold : "Golf",
        Cycling : "Cycling"
    },
    Toys : {
        ActionFigures : "Action Figures",
        StuffedToys : "Stuffed Toys"
    },
    Music : {
        Guitars : "Guitars",
        CDs : "CDs",
        Drums : "Drums"
    }
};
ebayApp.controller('sellerController',  ['$scope', '$http', function($scope, $http, $routeParams, $location) {

    $scope.data = {
        name : "",
        description : "",
        pcondition: '',
        category: '',
        subcategory: '',
        forAuction: false,
        auction:{
            price: 0,
            duration: ''
        },
        fixedprice:{
            price: 0,
            quantity: 1,
            duration: ''
        },
        shippingPrice: 0,
        freeShipping: false
    };
    $scope.categories = [];
    $scope.subCategories = [];
    $scope.productConditions = [];
    $scope.AuctionTab = false;
    $scope.FixedPriceTab = false;
    $scope.showFixedPrice = function () {
        $scope.AuctionTab = false;
        $scope.data.forAuction = false;
        $scope.FixedPriceTab = true;
    }
    $scope.showAuction = function () {
        $scope.AuctionTab = true;
        $scope.data.forAuction = true;
        $scope.FixedPriceTab = false;
    }
    $scope.updateSubCat = function () {
        $scope.subCategories = [];
        angular.forEach(subCategories[$scope.data.category], function (k,v) {
            $scope.subCategories.push({key: k, value: v});
        });
    }
    $scope.result = false;
    $scope.sale;
    $scope.saleUrl;
    $scope.error = false;
    $scope.validationError = false;
    $scope.submitForm = function () {
        if($scope.myForm.$valid){
            $scope.validationError = false;
            $http({
                method: 'POST',
                url: '/sell/addProduct/',
                data: $scope.data
            }).then(function (e) {
                if(e.data.result){
                    $scope.result = true;
                    $scope.saleUrl = e.data.url;
                    $scope.sale = $scope.data.forAuction ? "auction" : "sale";
                } else{
                    $scope.error = true;
                }
            }, function (e) {
                $scope.error = true;
            });
        } else{
            $scope.validationError = true;
        }

    }
    angular.forEach(productConditions, function (k,v) {
        $scope.productConditions.push({key: k, value: v});
    });

    angular.forEach(categories, function (k,v) {
        $scope.categories.push({key: k, value: v});
    });
    Date.prototype.addDays= function(d){
        return this.setDate(this.getDate() + d)
    };
    Date.prototype.mySQLDate = function () {
        return this.toISOString().substring(0, 19).replace('T', ' ')
    };
    var sa = setValidity(3);
    function setValidity(days) {
        var dt;
        if(days == 0){ //default 2020
            dt = new Date("2020-12-31");
        }
        else{
            dt = new Date();
            dt.addDays(days);
        }
        return dt.mySQLDate();
    }

}]);

