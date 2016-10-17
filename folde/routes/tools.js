var ejs = require("ejs");
var mysql = require("./mysql.js");

var renderView = function (viewPath, res) {
    ejs.renderFile(viewPath, function(err, result) {
//		render on success
        if (!err) {
            res.end(result);
        }
//		render or error
        else {
            res.end('An error occurred');
            console.log(err);
        }
    });
}
var executeCode = function (fn, errFn) {
    try{
        return fn();
    }
    catch(e){
        console.log(e);
        if(errFn  != undefined)
            errFn();
    }
}

function generateUsername(obj) {
    var username = "";
    if(obj.firstname != undefined &&obj.lastname != undefined&& obj.phone != undefined )
        username = obj.firstname + obj.lastname + obj.phone.slice(-1);
    return username;
}

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
Date.prototype.addDays= function(d){
    return this.setDate(this.getDate() + d)
};
Date.prototype.mySQLDate = function () {
    return this.toISOString().substring(0, 19).replace('T', ' ')
};

function getShoppingCart(userid,succFn,errFn) {
    mysql.fetchData("select * from cartlines c join products p on c.pid = p.productid where c.userid = ?", userid, succFn, errFn);
}
function getDecimalVal(numb) {
    numb = numb + ""; //cnvrt to string
    var nums = numb.split('.');

    if(nums.length > 1){
        return numb.toFixed(2);
    }
    else{
        numb =numb + '.00';
        numb = parseFloat(numb).toFixed(2);
        return  numb;
    }
}

function isBidUp(time) {
    var t = Date.parse(time) - Date.parse(new Date());
    return t <=0;
}
function getExpTime(time) {
    var expDate = new Date(time);
    return expDate.toDateString() + " " + expDate.toLocaleTimeString();
}
module.exports = {
    renderView : renderView,
    executeCode : executeCode,
    generateUsername: generateUsername,
    getDecimalVal: getDecimalVal,
    setValidity : setValidity,
    isBidUp : isBidUp,
    getExpTime : getExpTime,
    getShoppingCart: getShoppingCart
}
