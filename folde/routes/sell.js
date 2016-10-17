/**
 * Created by Rentala on 03-10-2016.
 */
var express = require('express');
var router = express.Router();
var ejs = require("ejs");
var tool = require("./tools.js");
var mysql = require("./mysql.js");
var models = require("./models.js");
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('./sell/sell.ejs', { hasError : false,
        isSignin : false,
        loginfailed: false
    });
});
router.get('/success', function(req, res, next) {
    res.send(JSON.stringify({ result: true }));
});

router.post('/addProduct', function(req, res, next) {
    console.log("addProduct");
    //req.body.sellerid = req.mySession.user.id;
    insertProduct(req.body, function (data, id) {
        res.send(JSON.stringify({ result: true, url: "/shopping/product/"+id }));
    },function () {
        res.send(JSON.stringify({ result: false }));
    });
});

function insertProduct(product, succFn, errFn) {
    tool.executeCode(function () {
        var dbproduct = new models.product(product);
        mysql.insertData("INSERT INTO products SET ?",dbproduct, succFn, errFn);
    }, errFn);
}

module.exports = router;