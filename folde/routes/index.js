var express = require('express');
var router = express.Router();
var ejs = require("ejs");
var tool = require("./tools.js");
var mysql = require("./mysql.js");
var models = require("./models.js");
var winston = require('winston');
const eventlogger = new (winston.Logger)({
    transports: [
        // colorize the output to the console
        new (winston.transports.File)({
            filename: './logs/events.log'
        })
    ]
});
eventlogger.info('Hello world');
eventlogger.warn('Warning message');
eventlogger.debug('Debugging info');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ebay' });
});

router.get('/sorry', function(req, res, next) {
    res.render('sorry', { errorid: req.mySession.errorid });
});

router.get('/user/:id', function(req, res, next) {
  getUserById(req.params.id, function (rows) {
      getProductsById(req.params.id, function (prodRows) {
          console.log(prodRows);
          res.render('seller', { user: rows[0], prods: prodRows});
      }, function (e) {

      })

  }, function (e) {

  });
});

router.get('/currentUser', function (req, res, next) {
    res.send({ result: true , username: req.mySession.user.username, id: req.mySession.user.user_id });
});
router.get('/history', function(req, res, next) {
        getOrderHistory(req.mySession.user.user_id, function (prods) {
            getWonBids(req.mySession.user.user_id, function (bids) {
                console.log(req.mySession.user.user_id);
                res.render('history', { prods: prods, bids: bids});
            }, function () {

            });
        }, function (e) {

        });
});
router.post('/log', function(req, res, next) {
    eventlogger.info('User Id: '+req.mySession.user.user_id+', '+ req.body.event+ ', '+ req.body.text);
    res.send(JSON.stringify({ result: true }));
});

function getUserById(id, succ, err) {
  mysql.fetchData("select * from users WHERE user_id = ?", id, succ, err);
}
function getOrderHistory(id, succ, err) {
    mysql.fetchData("select * from orders o join orderlines ol on ol.orderid = o.orderid join products p on p.productid = ol.productid where user_id = ?",
        id, succ, err);
}
function getProductsById(id, succ, err) {
    mysql.fetchData("select * from users u join products p on u.user_id = p.sellerid where u.user_id = ?", id, succ, err);
}
function getWonBids(id, succ, err){
    mysql.fetchData("select p.*, max(b.amount) as bidamount, b.cust_id as cust_id from bid b join products p on b.product_id = p.productid "+
    "where p.validity < NOW() && cust_id =? group by p.productid", id, succ, err);
}

module.exports = router;
