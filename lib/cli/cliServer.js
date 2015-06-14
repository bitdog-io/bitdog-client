var EventEmitter = require('events').EventEmitter;
var logger = require('../logger.js');
var util = require('util');
var http = require('http');
var configuration = require('../configuration.js');
var constants = require('../constants.js');

var _httpServer = null;
var _cliServer = null;
var _port = 9000;

function CliServer() {

}

util.inherits(CliServer, EventEmitter);

CliServer.prototype.start = function () {
    _server = http.createServer();

    _server.on('error', onError);
    _server.on('listening', onListening.bind(null, _port));
    _server.on('close', onClose);

    _server.listen(_port, '127.0.0.1');


};

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
    var addr = _server.address();
    logger.log(constants.LOG_CATEGORY_PROCESS_EVENT, 'CLI listening at ' + addr.address + ':' + port);
}

function onClose(error) {
    
    shuttingDown = false;
    started = false;
    server = null;
    
    logger.log(constants.LOG_CATEGORY_PROCESS_EVENT, 'Web administration shutdown');
    
}

module.exports = _cliServer = new CliServer();


