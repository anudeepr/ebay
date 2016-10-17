/**
 * Created by Rentala on 29-09-2016.
 */
var express = require('express');
var router = express.Router();
var ejs = require("ejs");
var tool = require("./tools.js");
var mysql = require("./mysql.js");
var models = require("./models.js");
var winston = require('winston');
const bidlogger = new (winston.Logger)({
    transports: [
        // colorize the output to the console
        new (winston.transports.File)({
            filename: './logs/bids.log'
        })
    ]
});
var Promise = require("bluebird");

/* GET users listing. */
router.get('/shipping', function(req, res, next) {
    if(req.mySession.cart !=undefined && req.mySession.cart.products !=undefined && req.mySession.cart.products.length > 0){
        res.render('./shopping/shipping.ejs',{ hasError : false,
            isSignin : false,
            loginfailed: false
        });
    } else{
        res.redirect('/#/cart?err=1');
    }

});

router.post('/api/addshipping', function(req, res, next) {
    var data = req.body;
    data.user_id = req.mySession.user.user_id;
    req.mySession.order = new models.order(data);
    res.redirect('/shopping/review');
});
router.post('/api/order', function(req, res, next) {
    var data = req.body;
    var order = req.mySession.order;
    order.createdon = new Date().mySQLDate();
    createOrder(order, function (obj, orderid) {
        var orderlines = [];
        console.log("orderid created: "+orderid);
        req.mySession.cart.products.forEach(function (prod) {
            orderlines.push([ prod.productid, prod.quantity, orderid ]);
        });
        req.mySession.orderid = orderid;
        req.mySession.lastOrderBuy = true;
        createOrderLines(orderlines, function (obj, orderlineid) {
            console.log("obj"+obj);
            console.log("orderlineid" + orderlineid);
            console.log("uid: "+req.mySession.user.user_id)
            clearProduct(req.mySession.cart.products, function () {
                console.log("clearProduct");
                clearCart(req.mySession.user.user_id, function (o) {
                    req.mySession.cart = undefined;
                    res.redirect('/#/confirmation');
                }, function (e) {

                });
            }, function () {

            });

        }, function () {

        });
        //res.redirect('/#/confirmation');
    }, function (e) {

    });

});

router.get('/review', function (req, res, next) {
    if(req.mySession.order!=undefined && req.mySession.cart !=undefined){
        var totalShipping = 0;
        var orderTotal = 0;
        req.mySession.cart.products.forEach(function (prod) {
            orderTotal += prod.price * prod.quantity;
            totalShipping += prod.delprice;
        });
        req.mySession.cart.totalShipping = totalShipping;
        req.mySession.cart.orderTotal = orderTotal+totalShipping;
        req.mySession.cart.totalShipping == 0 ? "Free": "$"+req.mySession.cart.totalShipping
        res.render('./shopping/review.ejs', { order: req.mySession.order, cart : req.mySession.cart });
    } else{
        res.redirect('/');
    }

});
router.get('/category/:category', function(req, res, next) {
    jresponse = res;
    var category = req.params.category;
    getProductsOfCategory(category, jsonSuccessResp, jsonErrorResp)
});

router.get('/all', function(req, res, next) {
    jresponse = res;
    getAllProducts(0,10, jsonSuccessResp, jsonErrorResp)
});
router.get('/all/:l/:u', function(req, res, next) {
    jresponse = res;
    getAllProducts(req.params.l,req.params.u, jsonSuccessResp, jsonErrorResp)
});
router.get('/api/shoppingcart', function(req, res, next) {
    //set this cart when user logs in.
    var result = false;
    var cart, username, id;
    if(req.mySession != undefined && req.mySession.cart){
        console.log(req.mySession.cart);
        cart = new models.shoppingcart(req.mySession.cart);
        console.log(cart);
        cart.calculateTotal();
        result = true;

    }

    res.send(JSON.stringify({ result: result ,
        cart: cart, username: username, id: id }));
});


router.post('/api/addproduct', function(req, res, next) {
    getProductById(req.body.i, function (rows) {
        var cart = new models.shoppingcart();
        if(req.mySession != undefined && req.mySession.cart != undefined){
            cart = new models.shoppingcart(req.mySession.cart);
        }
        addProductToCart({ userid: req.mySession.user.user_id, pid: req.body.i, quantity: req.body.qty}, function () {
            rows[0].quantity = parseInt(req.body.qty);
            cart.products.push(rows[0]);
            cart.calculateTotal();
            req.mySession.cart = cart;
            if(req.body.tocart == "1"){
                res.redirect('/#/cart?m=' + rows[0].productid);
            } else{
                res.send(JSON.stringify({ result: true,cart: cart }));
            }
        }, function (e) {
            res.send(JSON.stringify({ result: false, e: e }))
        });

    }, function (e) {
        res.send(JSON.stringify({ result: false, e: e }))
    });
});
router.post('/api/removeProduct', function(req, res, next) {
    getProductById(req.body.i, function (rows) {
        var cart = new models.shoppingcart();
        if(req.mySession != undefined && req.mySession.cart != undefined){
            cart = new models.shoppingcart(req.mySession.cart);
        }
        removeProductFromCart(req.mySession.user.user_id, req.body.i, function (ob,id) {
            tool.getShoppingCart(req.mySession.user.user_id, function (rows) {
                req.mySession.cart = new models.shoppingcart({ products : rows});
                res.send(JSON.stringify({ result: true, cart : req.mySession.cart}))
            }, function () {
                loginFailed(res)
            })
        }, function () {
            res.send(JSON.stringify({ result: false }));
        });
    }, function (e) {
        res.send(JSON.stringify({ result: false, e: e }))
    });
});
router.post('/api/placebid', function(req, res, next) {
    getProductById(req.body.i, function (rows) {
        var product = rows[0];
        bidProduct({ productid: product.productid, amount: req.body.bidamount, userid: 1}, function (ob, id) {
            updateProductPrice(req.body.bidamount, product.productid ,function () {
                req.mySession.bidid = id;
                req.mySession.lastOrderBuy = false;
                res.redirect('/#/confirmation');
            }, function (e) {
                res.send(JSON.stringify({ result: false, e: e }))
            })
        }, function (e) {
            res.send(JSON.stringify({ result: false, e: e }))
        });
    }, function (e) {
        res.send(JSON.stringify({ result: false, e: e }))
    });
});

router.get('/api/confirmation', function(req, res, next) {
    if(req.mySession.lastOrderBuy == false){
        getBidById(req.mySession.bidid, function (rows) {
            rows[0].expTime = tool.getExpTime(rows[0].validity);
            rows[0].isBidUp = tool.isBidUp(rows[0].validity);
            res.send(JSON.stringify({ result: true, order:false, bid  : rows[0] }));
        }, function () {
            res.send(JSON.stringify({ result: false}))
        })
    } else if(req.mySession.lastOrderBuy == true){
        getProductsByOrderId(req.mySession.orderid, function (rows) {
            res.send(JSON.stringify({ result: true, order:true, orders  : rows, orderid:req.mySession.orderid }));
        }, function (e) {
            res.send(JSON.stringify({ result: false}));
        })

    } else {
        res.send(JSON.stringify({ result: false}));
    }


});

router.get('/product/:id', function(req, res, next) {
    getProductById(req.params.id, function (rows) {
        console.log(JSON.stringify(rows[0]));
        rows[0].expTime = tool.getExpTime(rows[0].validity);
        rows[0].isBidUp = tool.isBidUp(rows[0].validity);
        res.render('./products.ejs',{ product : rows[0]});
    }, function (e) {
        res.redirect('/');
    });
});
router.get('/all/:count', function(req, res, next) {
    var count = parseInt(req.params.count);
    jresponse = res;
    getAllProducts(count,jsonSuccessResp, jsonErrorResp)
});
router.get('/category/:category/:subcategory', function(req, res, next) {
    jresponse = res;
    var category = req.params.category;
    var subcategory = req.params.subcategory;
    getProductsOfSubCategory(category, subcategory ,jsonErrorResp, jsonSuccessResp)
});
function getProductsOfCategory(cat, succ, err) {
    //cat = models.categories[cat];
    mysql.fetchData("select * from products where category = ? && quantity > 0", cat, succ, err);
}
function getProductsOfSubCategory(cat, subcat, succ, err) {
    subcat = models.subCategories[subcat];
    cat = models.categories[cat];
    mysql.fetchData("select * from products where category = ? && subcategory = ? && quantity>0", [cat,subcat], succ, err);
}
function getAllProducts(upper, succ, err) {
    mysql.fetchData("select * from products where quantity > 0  order by validity desc LIMIT ?", upper , succ, err);
}
function getProductById(id, succ, err) {
    mysql.fetchData("select * from products WHERE productid = ?", id, succ, err);
}
function getBidById(id, succ, err) {
    mysql.fetchData("select * from bid b join products p on b.product_id = p.productid where b.id = ?", id, succ, err);
}
function addProductToCart(cartLine, succFn, errFn) {
    tool.executeCode(function () {
        var cLine = new models.cartLine(cartLine);
        mysql.insertData("INSERT INTO cartlines SET ? ",cLine, succFn, errFn);
    }, errFn);

}
function removeProductFromCart(userid, pid, succFn, errFn) {
    tool.executeCode(function () {
        mysql.deleteData("delete from cartlines where userid = ? && pid = ?",[userid, pid], succFn, errFn);
    }, errFn);

}
function createOrder(ordr, succFn, errFn) {
    mysql.insertData("INSERT INTO orders SET ? ",ordr, succFn, errFn);
}
function createOrderLines(orderlines,succFn, errFn) {
    mysql.insertData("INSERT INTO orderlines (productid,quantity,orderid) VALUES  ? ",[orderlines], succFn, errFn);
}
function clearProduct(products, succFn,errFn ) {
    products.forEach(function (prod) {
        mysql.insertData("UPDATE products SET quantity=quantity-"+prod.quantity+" WHERE productid="+prod.productid,undefined,succFn, errFn);
    });
}
function clearCart(userid, succFn,errFn ) {
    mysql.deleteData("delete from cartlines where userid = ? ", userid,succFn, errFn);
}
function bidProduct(bid, succFn, errFn) {
    tool.executeCode(function () {
        var bidLine = new models.bid(bid);
        bidlogger.info('Bid registered ' + JSON.stringify(bid));
        mysql.insertData("INSERT INTO bid SET ? ",bidLine, succFn, errFn);
    }, errFn);

}
function getProductsByOrderId(orderid,succFn,errFn) {
    mysql.fetchData("select *, ol.quantity as orderQty from orders o join orderlines ol on o.orderid = ol.orderid join products p on ol.productid = p.productid where ol.orderid = ?",
        orderid, succFn, errFn);
}
function updateProductPrice(price, pid, succFn, errFn) {
    tool.executeCode(function () {
        mysql.insertData("UPDATE `test`.`products` SET `price`= ? WHERE `productid`= ?;",[ price, pid], succFn, errFn);
    }, errFn);

}
var jresponse;
var jsonSuccessResp = function (rows) {
    jresponse.setHeader('Content-Type', 'application/json');
    jresponse.send(JSON.stringify({ result: rows != undefined && rows.length > 0 ,rows: rows }));
}
var jsonErrorResp = function (e) {
    jresponse.setHeader('Content-Type', 'application/json');
    jresponse.send(JSON.stringify({ result: false, error: e }));

}

module.exports = router;