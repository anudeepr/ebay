/**
 * Created by Rentala on 28-09-2016.
 */
var tool = require("./tools.js");

var user = function (obj) {
    this.username = tool.generateUsername(obj);
    this.password = obj.password;
    this.email = obj.email;
    this.firstname = obj.firstname;
    this.lastname = obj.lastname;
    this.phone = obj.phone;
}
var bid = function (obj) {
    this.product_id = obj.productid;
    this.amount = obj.amount;
    this.cust_id = obj.userid;
}

var product = function (obj) {
    this.name = obj.name;
    this.description = obj.description;
    this.price = obj.forAuction ? tool.getDecimalVal(obj.auction.price): tool.getDecimalVal(obj.fixedprice.price);
    this.delprice = obj.freeShipping ? 0.00 : tool.getDecimalVal(obj.shippingPrice);
    this.pcondition = obj.pcondition;
    this.sellerid = 9;
    this.forAuction = obj.forAuction ? 1 : 0;
    this.subcategory = obj.subcategory;
    this.category = obj.category;
    this.quantity = getQuantity(obj);
    if(!((obj.url == "") || (obj.url = undefined))){
        this.url = obj.url;
        console.log()
    }
    console.log(this.url);
    this.validity = obj.forAuction ? tool.setValidity(obj.auction.duration): tool.setValidity(obj.fixedprice.duration);

};
var getQuantity = function (obj) {
    return obj.forAution ? 1 : obj.fixedprice.quantity;
}
var order = function (obj) {
    this.user_id = obj.user_id;
    this.status = orderStatus.CONFIRMED;
    this.createdon = "";
    this.deliveredon;
    this.country = obj.country;
    this.address = obj.addressOne + " " + obj.addressTwo;
    this.zipcode = obj.pin;
    this.city = obj.city;
    this.state = obj.state;
    this.mobileno= obj.phone;
}
var orderLine = function (obj) {
    this.productid = obj.productid;
    this.quantity = obj.quantity;
    this.orderid = obj.orderid;
}
var orderStatus = {
    CONFIRMED : "CONFIRMED",
    INTRANSIT : "INTRANSIT",
    DELIVERED : "DELIVERED"
}
var cartLine = function (obj) {
    this.userid = obj.userid;
    this.pid = obj.pid;
    this.quantity = obj.quantity;
}
var shoppingcart = function (cart) {
    this.products = cart == undefined ? [] : cart.products;
    this.total=  cart == undefined ? 0 : cart.total;
    this.calculateTotal = function () {
        this.total = 0;
        for(var i =0; i < this.products.length; i++){
            this.total= parseInt(this.total) +
                parseInt(this.products[i].price)*parseInt(this.products[i].quantity);
        }
    }
}
const categories = {
    Fashion: "Fashion",
    Electronics: "Electronics",
    SportingGoods: "Sporting Goods",
    Toys : "Toys",
    Music: "Music"
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
const productCondition ={
    New : "New",
    Used : "Used"
}

module.exports = {
    user : user,
    product : product,
    categories: categories,
    subCategories: subCategories,
    cartLine : cartLine,
    bid : bid,
    order: order,
    orderStatus: orderStatus,
    orderLine: orderLine,
    shoppingcart: shoppingcart
}
