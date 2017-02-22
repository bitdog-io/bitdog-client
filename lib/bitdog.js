"use strict"; 

// Private class definitions
var Session = require('./session.js');
var HashTable = require('./hashtable.js');
var MessageSchema = require('./messageSchema.js');
var EventEmitter = require('events').EventEmitter;

var util = require('util');
var path = require('path');
var logger = require('./logger.js');
var configuration = require('./configuration.js');
var constants = require('./constants.js');
var adminManager = require('./admin/managers/adminManager.js');

var _messageSchemas = new HashTable();
var _starttime = Date.now();
var _session = null;
var _webProcess = null;
var _userCodeProcess = null;
var _applicationName = 'bitdog-client';

function Bitdog() {
    
 
}

util.inherits(Bitdog, EventEmitter);

// Creates a new message schema
Bitdog.prototype.createMessageSchema = function (name) {
    var messageSchema = new MessageSchema(name);
    _messageSchemas.put(messageSchema.name, messageSchema);
    
    return messageSchema;
};

Bitdog.prototype.getStatus = function () {
        
        var isRegistered = configuration.isRegistered;
        var sessionStatus = new Array();
 
        sessionStatus.push(_session.getStatus());
   
        return { isRegistered: isRegistered, connections: sessionStatus };
};


Bitdog.prototype.addCommand = function (name, messageSchema, executeCallback, startCallback, stopCallback, hidden) {
    return _session.addCommand(name, messageSchema, executeCallback, startCallback, stopCallback, hidden);
};

Bitdog.prototype.addDataCollector = function (name, messageSchema, intervalMilliseconds, collectCallback, hidden) {
    return _session.addDataCollector(name, messageSchema, intervalMilliseconds, collectCallback, hidden);
};

Bitdog.prototype.sendCommand = function (destinationNodeId, name, messageSchema, callback) {
    return _session.sendCommand(destinationNodeId, name, messageSchema, callback)
};

Bitdog.prototype.sendIFTTTCommand = function (appId, name, callback) {
    return _session.sendCommand('IFTTT', name, this.commonMessageSchemas.iftttMessageSchema, callback, { i: appId } )
};

Bitdog.prototype.sendData = function (name, messageSchema, callback) {
    return _session.sendData(name, messageSchema, callback)
};

Bitdog.prototype.sendMessage = function (message) {
    return _session.sendMessage(message);
};

Bitdog.prototype.addSubscription = function (nodeId, name, mode, consumeCallback) {
    return _session.addSubscription(nodeId, name, mode, consumeCallback)
};

Bitdog.prototype.start = function () {
    return _session.start();
};

Bitdog.prototype.stop = function () {
    return _session.stop();
};


// Returns a message type with the given name
Bitdog.prototype.getMessageSchema = function (name) {
    return _messageSchemas.get(name);
};

Bitdog.prototype.__defineGetter__('nodeId', function () {
    return _nodeId;
});

Bitdog.prototype.__defineGetter__('uptimeProcess', function () {
    return (Date.now() - _starttime) / 1000
});

Bitdog.prototype.__defineGetter__('commonMessageSchemas', function () {
    return require('./commonMessageSchemas.js');
});

Bitdog.prototype.__defineGetter__('coreMessageSchemas', function () {
    return require('./coreMessageSchemas.js');
});

Bitdog.prototype.__defineGetter__('filename', function () {
    return module.filename;
});

Bitdog.prototype.__defineGetter__('logger', function () {
    return logger;
});

Bitdog.prototype.__defineGetter__('adminManager', function () {
    return adminManager;
});

Bitdog.prototype.__defineGetter__('constants', function () {
    return constants;
});

Bitdog.prototype.__defineGetter__('configuration', function () {
    return configuration;
});

Bitdog.prototype.__defineGetter__('applicationName', function () {
    return _applicationName;
});

Bitdog.prototype.__defineSetter__('applicationName', function (value) {
    _applicationName = value;
});

// Singleton export
var _bitdog = new Bitdog();
module.exports = _bitdog;

function onSessionReady(logger, configuration) {
    _bitdog.emit('ready', logger, configuration );
}

function onMessage(message) {
    _bitdog.emit('message', message);
}

// Start single connection, more might be supported in future.
// Requires bitdog object so the creation is at the bottom of the file
_session = new Session();
_session.on('ready', onSessionReady);
_session.on('message', onMessage);
