"use strict"; 

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sessions = require("client-sessions");
var uuid = require('node-uuid');
var expressapp = express();

expressapp.use(bodyParser.json());
expressapp.use(bodyParser.urlencoded({ extended: false }));
expressapp.use(cookieParser());
expressapp.use(sessions({
    cookieName: 'session', // cookie name dictates the key name added to the request object 
    secret: uuid.v4(), // should be a large unguessable string 
    duration: 60 * 60 * 1000, // how long the session will stay valid in ms 
    cookie: {
        path: '/', // cookie will be sent to requests under '/' 
        ephemeral: true, // when true, cookie expires when the browser closes 
        httpOnly: true, // when true, cookie is not accessible from javascript 
        secure: false // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process 
    }
}));

expressapp.all('/secure/*', function (req, res, next) {
    if (req.session.isLoggedIn)
        next() // pass control to the next handler
    else
        res.redirect('/home');
})

expressapp.use(require('./routes/api.js'));

// catch 404 and forward to error handler
expressapp.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.locals.pageTitle = 'Not Found';
    next(err);
});

// error handlers

// production error handler
// no stacktraces leaked to user
expressapp.use(function(err, req, res, next) {
    var Context = require('./routes/context.js');
    var context = new Context(req, res, next);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
        error: {},
    context: context
  });
});


module.exports = expressapp;
