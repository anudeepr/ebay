var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var mlogger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var authentication = require('./routes/authentication.js');
var shopping = require('./routes/shopping.js');
var sell = require('./routes/sell.js')
var app = express();
var sessions = require("client-sessions");
var mysql = require("./routes/mysql.js")
var bcrypt = require('bcrypt');
var winston = require('winston');
var Promise = require("bluebird");

const errorLogger = new (winston.Logger)({
  transports: [
    // colorize the output to the console
    new (winston.transports.File)({
      filename: './logs/errors.log'
    })
  ]
});

app.use(sessions({
  cookieName: 'mySession', // cookie name dictates the key name added to the request object
  secret: 'cmpe273', // should be a large unguessable string
  duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
  activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(mlogger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.all('*', handleErrors);
app.use('/auth', authentication);

app.all('*', assertAuthentication);
app.use('/shopping', shopping);
app.use('/', routes);
app.use('/sell', sell);
function assertAuthentication(req, res, next) {
  /*if(req.mySession.user == undefined){
    res.redirect('/auth/signin')
  } else{
    next();
  }*/
  next();
}
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
function handleErrors(req, res, next) {
  executeCode(function () {
    next();
  }, function (e) {
    var id = getID();
    errorLogger.info('Error Id: ' + id + ' Error: ' + JSON.stringify(e));
    req.mySession.errorid = id;
    res.redirect('/sorry')
  })
}
var executeCode = function (fn, errFn) {
  Promise.try(fn).catch(function(e){
    console.log(e);
    if(errFn  != undefined)
      errFn(e);
  });
}
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

var connMgr = new mysql.connectionManager(500);
var getID = function () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

module.exports = app;
