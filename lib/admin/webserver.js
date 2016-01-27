"use strict"; 

var EventEmitter = require('events').EventEmitter;

var expressapp = require('./expressapp.js');
var debug = require('debug')('webserver:server');
var http = require('http');
var configuration = require('../configuration.js');
var logger = require('../logger.js');
var portchecker = require('portchecker');
var util = require('util');
var constants = require('../constants.js');

var _server = null;
var _started = false;
var _shuttingDown = false;
var _webserver = null; 
var _embedded = true;  


function WebServer(){
  
   
}

util.inherits(WebServer, EventEmitter);

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EADDRINUSE':
            logger.log(constants.LOG_CATEGORY_ERROR,configuration.webadminPort + ' is already in use');
            break;
        default:
            throw error;
    }
}


function onListening(port) {
    logger.log(constants.LOG_CATEGORY_STATUS,'Web administration listening on port ' + port);
}

function onClose(error) {
    
    shuttingDown = false;
    started = false;
    server = null;
    
    if (configuration.shouldLogProcessEvents)
        logger.logProcessEvent(constants.LOG_PROCESS_WEBADMIN,'Shutdown');
    
}

function startWebServer(port) {

    _server = http.createServer(expressapp);
    _server.on('error', onError);
    _server.on('listening', onListening.bind(null,port));
    _server.on('close', onClose);
    
    _server.listen(port);
}

WebServer.prototype.start = function (embedded) {
    var port = configuration.webadminPort;
    _embedded = embedded;
    
    if (!_started) {
        _started = true;
        
        if (port == 'auto')
            portchecker.getFirstAvailable(2000, 5000, '0.0.0.0', function (port) {
                startWebServer(port);
            });
        else
            startWebServer(port);
    }

    return this;
};

WebServer.prototype.stop = function () {
    if (_started && !_shuttingDown) {
        _shuttingDown = true;
        _server.close();
    }
};

WebServer.prototype.getStatus = function (callback) {
    
    if (!_embedded) {
        this.once('status', callback);
        process.send({ name: 'getStatus' });
    }
    else {
        var bitdog = require('../bitdog.js');
        callback(bitdog.getStatus());
    }
};

WebServer.prototype.startClient = function () {
    
    if (!_embedded) {
        process.send({ name: 'startClient' });
    }
    else {
        var bitdog = require('../bitdog.js');
        bitdog.start();
    }
};

WebServer.prototype.statusReturned = function (status) {
    _webserver.emit('status', status);
};

process.on('disconnect', function () {
    process.kill();
});

process.on('message', function (message) {
    
    if (typeof message != 'undefined' && typeof message.name != 'undefined') {
        switch (message.name) {
            case 'start':
                _webserver.start(false);
                break;
            case 'stop':
                _webserver.stop();
                break;
            case 'status':
                if (typeof message.body != 'undefined')
                    _webserver.statusReturned(message.body);
                break;

            
        }
    }

});

// Singleton export 
module.exports = _webserver = new WebServer();

