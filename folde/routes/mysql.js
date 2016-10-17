/**
 * Created by Rentala on 28-09-2016.
 */
/**
 * http://usejsdoc.org/
 */
var ejs= require('ejs');//importing module ejs
var mysql = require('mysql');//importing module mysql
var tool = require("./tools.js");
var connMgr;
function connectionManager(capacity) {
    var connections = [];
    for(var i=0; i <capacity; i++){
        connections.push(getConnection());
    }
    function hasConn() {
        return connections.length > 0;
    }
    this.getConn = function (func) {
        if(hasConn()){
            var conn = connections.pop();
            func(conn);
            console.log("used a conn. Conns total: " + connections.length);
            connections.push(conn);
            console.log("put a conn. Conns total: " + connections.length);
        } else{
            setTimeout(getConn, 100);
            console.log("waiting for conn");
        }
    }
    this.releaseConn = function (conn) {
        connections.push(conn);
    }
    this.connections = capacity;
    connMgr = this;
}

function getConnection(){
    var connection = mysql.createConnection({
        host : 'localhost', //host where mysql server is running
        user : 'rentala', //user for the mysql application
        password : 'password@123', //password for the mysql application
        database : 'test', //database name
        port : 3306 //port, it is 3306 by default for mysql
    });
    return connection;
}
//fetching the data from the sql server
function fetchData(sqlQuery, param, successFn, errFn){
    console.log("\nSQL Query::"+sqlQuery);
    connMgr.getConn(function (connection) {
        connection.query(sqlQuery,param, function(err,res,as){
            if(err) throw err;
            if(successFn)successFn(res);
            if(res != undefined)
                console.log('Last insert ID:', res.insertId);
        }, errFn);
    });
}
function fetchDataOnQuery(sqlQuery, successFn, errFn){
    console.log("\nSQL Query::"+sqlQuery);
    var connection= getConnection();
    tool.executeCode(function () {
        connection.query(sqlQuery, function(err,res,as){
            if(err) throw err;
            if(successFn)successFn(res);
            if(res != undefined)
                console.log('Last insert ID:', res.insertId);
        }, errFn);
    });

    console.log("\nConnection closed..");
    connection.end();
}
//insert the data from the sql server
function insertData(sqlQuery, obj, successFn, errFn){
    console.log("\nSQL Query::"+sqlQuery);
    console.log("\nObJ : " + obj);
    connMgr.getConn(function (connection) {
        connection.query(sqlQuery, obj, function(err,res){
            if(err) throw err;
            if(successFn)successFn(obj, res.insertId);
            if(res != undefined)
                console.log('Last insert ID:', res.insertId);
        }, errFn);
    });
}
//insert the data from the sql server
function updateData(sqlQuery, obj, callback){
    console.log("\nSQL Query::"+sqlQuery);
    connMgr.getConn(function (connection) {
        connection.query(sqlQuery, obj, function(err,res){
            if(err) throw err;
            if(callback)callback();
            console.log('Changed ' + res.changedRows + ' rows');
        });
    });
}
//insert the data from the sql server
function deleteData(sqlQuery, obj, callback){
    console.log("\nSQL Query::"+sqlQuery);
    connMgr.getConn(function (connection) {
        connection.query(sqlQuery, obj, function(err,res){
            if(err) throw err;
            if(callback)callback();
            console.log('Deleted ' + res.affectedRows + ' rows');
        });
    });
}

exports.fetchData=fetchData;
exports.fetchDataOnQuery = fetchDataOnQuery;
exports.insertData=insertData;
exports.updateData=updateData;
exports.deleteData=deleteData;
exports.connectionManager = connectionManager;