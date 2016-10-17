/**
 * Created by Rentala on 30-09-2016.
 */
var ebayApp = angular.module('ebayApp', ['ngRoute']);

/**
 * Created by Rentala on 04-10-2016.
 */
ebayApp.config(function($routeProvider) {
    $routeProvider

    // route for the home page
        .when('/', {
            templateUrl: 'views/products.html',
            controller: 'homeController'
        })
        .when('/shopping/category/:cat', {
            templateUrl: 'views/products.html',
            controller: 'homeController'
        })
        .when('shopping/category/:cat/:subcat', {
            templateUrl: 'views/products.html',
            controller: 'homeController'
        })
        .when('/cart', {
            templateUrl: 'views/cart.html',
            controller: 'cartController'
        })
        // route for the about page
        .when('/shopping', {
            templateUrl: 'pages/about.html',
            controller: 'shoppingController'
        })
        .when('/confirmation', {
            templateUrl: 'views/confirmation.html',
            controller: 'confirmController'
        })
});

$(function () {
    $.ajax({
        method: "GET",
        url: "/currentUser"
    }).done(function(e) {
        var usertag = document.getElementById("username");
        usertag.innerText= e.username;
        usertag.href = "/user/"+e.id;
    });


});