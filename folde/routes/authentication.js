/**
 * Created by Rentala on 28-09-2016.
 */
var express = require('express');
var router = express.Router();
var ejs = require("ejs");
var tool = require("./tools.js");
var mysql = require("./mysql.js");
var models = require("./models.js");
var bcrypt = require('bcrypt');
/* GET users listing. */
router.get('/register', function(req, res, next) {
    res.render('./authentication/siginregister.ejs',{ hasError :  checkError(req),
        isSignin : false,
        loginfailed: false
    });
});
router.get('/signin', function(req, res, next) {
    res.render('./authentication/siginregister.ejs',{ loginfailed: checkLoginError(req),
        hasError :  checkError(req),
        isSignin : true
    });
});
router.get('/signout', function(req, res, next) {
    req.mySession.destroy();
    res.redirect('/');
});
function checkError(req) {
    return req.query.err && req.query.err == '1';
}
function checkLoginError(req) {
    return req.query.err && req.query.err == '2';
}


router.post('/signinUser', function(req, res, next) {

    var errFn = function () {
        res.redirect('/auth/sigin?err=1')
    }
    var loginFailed = function (res) {
        res.redirect('/auth/sigin?err=2')
    }
    getUser(req.body, function (rows) {
        if(rows !=undefined && rows.length > 0){
            var user = rows[0];
            if(validateUser(user, req.body.password)){
                req.mySession.user = user;
                tool.getShoppingCart(user.user_id, function (rows) {
                    console.log(rows);
                    req.mySession.cart = new models.shoppingcart({ products : rows});
                    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                    res.redirect('/');
                }, function () {
                    loginFailed(res)
                })

            }
            else{
                loginFailed(res);
            }
        } else{
            loginFailed(res);
        }
    }, errFn);
});
router.get('/welcome', function(req, res, next) {
    res.render('./authentication/welcome', req.mySession.user);
});
router.post('/create', function(req, res, next) {

    console.log(req.body);
    insertUser(req.body, function (data, id) {
        req.mySession.user = data;
        console.log("user id " + id)
        req.mySession.user.user_id = id;
        res.redirect('/auth/welcome');
    },function () {
        res.redirect('/auth/register?err=1');
    });


});
function insertUser(user, succFn, errFn) {
    tool.executeCode(function () {
        encryptPassword(user.password, function (pwd) {
            user.password = pwd;
            var dbuser = new models.user(user);
            mysql.insertData("INSERT INTO users SET ?",dbuser, succFn, errFn);
        });
    }, errFn);
}
function getUser(user, succFn, errFn) {
    tool.executeCode(function () {
        var dbuser = new models.user(user);
        mysql.fetchData("SELECT * FROM users WHERE email = ?", dbuser.email, succFn, errFn);
    }, errFn);
}
function validateUser(user, pwd) {
    return bcrypt.compareSync(pwd, user.password);
}

const saltRounds = 10;
function encryptPassword(password, func) {
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            console.log(hash);
            func(hash);
        });
    });
}


module.exports = router;
