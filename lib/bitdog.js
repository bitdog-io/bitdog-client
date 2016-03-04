"use strict"; 

// Private class definitions
var Session = require('./session.js');
var HashTable = require('./hashtable.js');
var MessageSchema = require('./messageSchema.js');
var Uuid = require('node-uuid');
var WebProcess = require('./webAdminProcess.js');
var UserCodeProcess = require('./userCodeProcess.js');
var EventEmitter = require('events').EventEmitter;


var util = require('util');
var path = require('path');
var logger = require('./logger.js');
var configuration = require('./configuration.js');
var cliServer = require('./cli/cliServer.js');
var constants = require('./constants.js');

var _messageSchemas = new HashTable();
var _starttime = Date.now();
var _session = null;
var _webProcess = null;
var _userCodeProcess = null;
var _applicationName = 'bitdog-client';

function bitdog() {
    
    if (process.mainModule.filename.indexOf('userCodeServer.js') == -1) {
        
        //cliServer.start();
        
        //_userCodeProcess = new UserCodeProcess();
        //_userCodeProcess.start();
        
        //if (configuration.webadminEnable) {
        //    var webserver = require('./admin/webserver.js');
        //    webserver.start(true);
        //}

        //if (configuration.webadminEnable) {
        //    _webProcess = new WebProcess();
        //    _webProcess.start();
        //}
    }

}

util.inherits(bitdog, EventEmitter);

// Creates a new message schema
bitdog.prototype.createMessageSchema = function (name) {
    var messageSchema = new MessageSchema(name);
    _messageSchemas.put(messageSchema.name, messageSchema);
    
    return messageSchema;
};

bitdog.prototype.getStatus = function () {
        
        var isRegistered = configuration.isRegistered;
        var sessionStatus = new Array();
 
        sessionStatus.push(_session.getStatus());
   
        return { isRegistered: isRegistered, connections: sessionStatus };
};


bitdog.prototype.addCommand = function (name, messageSchema, executeCallback, startCallback, stopCallback, hidden) {
    return _session.addCommand(name, messageSchema, executeCallback, startCallback, stopCallback, hidden);
};

bitdog.prototype.addDataCollector = function (name, messageSchema, intervalMilliseconds, collectCallback, hidden) {
    return _session.addDataCollector(name, messageSchema, intervalMilliseconds, collectCallback, hidden);
};

bitdog.prototype.sendCommand = function (destinationNodeId, name, messageSchema, callback) {
    return _session.sendCommand(destinationNodeId, name, messageSchema, callback)
};

bitdog.prototype.sendIFTTTCommand = function (appId, name, callback) {
    return _session.sendCommand('IFTTT', name, this.commonMessageSchemas.iftttMessageSchema, callback, { i: appId } )
};

bitdog.prototype.sendData = function (name, messageSchema, callback) {
    return _session.sendData(name, messageSchema, callback)
};

bitdog.prototype.sendMessage = function (message) {
    return _session.sendMessage(message);
};

bitdog.prototype.addSubscription = function (nodeId, name, mode, consumeCallback) {
    return _session.addSubscription(nodeId, name, mode, consumeCallback)
};

bitdog.prototype.start = function () {
    return _session.start();
};

bitdog.prototype.stop = function () {
    return _session.stop();
};


// Returns a message type with the given name
bitdog.prototype.getMessageSchema = function (name) {
    return _messageSchemas.get(name);
};

bitdog.prototype.__defineGetter__('nodeId', function () {
    return _nodeId;
});

bitdog.prototype.__defineGetter__('uptimeProcess', function () {
    return (Date.now() - _starttime) / 1000
});

bitdog.prototype.__defineGetter__('commonMessageSchemas', function () {
    return require('./commonMessageSchemas.js');
});

bitdog.prototype.__defineGetter__('filename', function () {
    return module.filename;
});

bitdog.prototype.__defineGetter__('logger', function () {
    return logger;
});

bitdog.prototype.__defineGetter__('constants', function () {
    return constants;
});

bitdog.prototype.__defineGetter__('configuration', function () {
    return configuration;
});

bitdog.prototype.__defineGetter__('applicationName', function () {
    return _applicationName;
});

bitdog.prototype.__defineSetter__('applicationName', function (value) {
    _applicationName = value;
});

// Singleton export
var _bitdog = new bitdog();
module.exports = _bitdog;

function sessionReady(logger, configuration) {
    _bitdog.emit('ready', logger, configuration );
}

// Start single connection, more might be supported in future.
// Requires bitdog object so the creation is at the bottom of the file
_session = new Session();
_session.on('ready', sessionReady);

