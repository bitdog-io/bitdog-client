'use strict'

var Client = require('signalr-client').client;
var SignalRConnection = require('../signalRConnection.js');
var Buffer = require('buffer').Buffer;
var EventEmitter = require('events').EventEmitter;

var util = require('util');
var constants = require('../constants.js');
var logger = require('../logger.js');
var configuration = require('../configuration.js');

function createConnection() {
    return new SignalRConnection();
}

function Session() {
    this._sessionEngine = new SessionEngine();
    this._sessionEngine.on('ready', this.emit.bind(this, 'ready'));
}

util.inherits(Session, EventEmitter);

Session.prototype.start = function () {
    this._sessionEngine.start(); 
    
};

Session.prototype.stop = function () {
    this._sessionEngine.stop();
};

Session.prototype.sendMessage = function (message) {
    return this._sessionEngine.sendMessage(message);
};

Session.prototype.getStatus = function () {
    return this._sessionEngine.getStatus();
};

Session.prototype.__defineGetter__('sessionActive', function () {
    return this._sessionEngine.sesstionActive;
});

function SessionEngine() {

    this._sessionActive = false;
    this._connectionActive = false;
    this._connection = createConnection();

    this._connection.serviceHandlers = {
        
        bound: function () { logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, 'Websocket bound'); },
        connectFailed: function (error) { logger.log(constants.LOG_CATEGORY_ERROR, 'Websocket connect failed: ', error); },
        disconnected: function () { logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, 'Websocket disconnected'); },
        onerror: function (error) { logger.log(constants.LOG_CATEGORY_ERROR, 'Websocket onerror: ', error); },
        bindingError: function (error) { logger.log(constants.LOG_CATEGORY_ERROR, 'Websocket binding error: ', error); },
        reconnecting: function (retry /* { inital: true/false, count: 0} */) {
            logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, 'Websocket retrying: ', retry);
            return false;  /* cancel retry true */
        },
        
        connected: this.onConnected.bind(this),
        connectionLost: this.onConnectionLost.bind(this),
        reconnected: this.onReconnected.bind(this),
        onUnauthorized: this.onUnauthorized.bind(this),
        messageReceived: this.onMessageReceived.bind(this)
    };
    
    // route message Handler
    this._connection.on(constants.AGENT_HUB_NAME, 'routeMessage', this.onRouteMessage.bind(this));
    
    // ErrorResponse Message Handler
    this._connection.on(constants.AGENT_HUB_NAME, 'ErrorResponse', this.onErrorResponse.bind(this));
    
};

util.inherits(SessionEngine, EventEmitter);

 // This function gathers meta data about all commands and data collectors and sends 
// it to the hub for use by other nodes.    
SessionEngine.prototype.startSession = function () {
    
    logger.log(constants.LOG_CATEGORY_STATUS, 'Connected to Bitdog, welcome!');

    this.emit('ready',logger, configuration);

};
    

    
SessionEngine.prototype.endSession = function () {


};
    
SessionEngine.prototype.start = function () {
    
    if (!this._sessionActive) {
        this._sessionActive = true;
        this._connection.start();   
    }
};    
    
SessionEngine.prototype.stop = function () {
    if (this._sessionActive) {
        this._sessionActive = false;
        this.endSession();
        this._connection.stop();
    }
};
 
SessionEngine.prototype.sendMessage = function (message) {
    var result = false;
    
    if (this._sessionActive && this._connectionActive) {
        result = this._connection.invoke(constants.AGENT_HUB_NAME, 'RouteMessage', message);
        logger.log(constants.LOG_CATEGORY_MESSAGE,'Sent ' + Buffer.byteLength(JSON.stringify(message), 'utf8') + ' byte message: ', message);
        result = true;
    }
    
    return result;
};
    
SessionEngine.prototype.getStatus = function () {
    return { isConnectionActive: this._connectionActive, isSessionActive: this._sessionActive, messageInCount: this._messageInCount, messageOutCount: this._messageOutCount, hub: constants.CENTRAL_HUB_URL };
};

SessionEngine.prototype.onConnected = function (connection) {
    
    logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, 'Websocket connected');
    this._connectionActive = true;
    this.startSession();
};

SessionEngine.prototype.onConnectionLost = function (error) {
    this._connectionActive = false;
    logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, 'Connection Lost: ', error);
};


SessionEngine.prototype.onReconnected = function (connection) {
    this._connectionActive = true;
    logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, 'Websocket reconnected');
};

SessionEngine.prototype.onUnauthorized = function (reason) {
    this.stop(); 
    logger.log(constants.LOG_CATEGORY_STATUS,'To learn how to activate your new node go to https://bitdog.io/activatenode for more information.'); 
};

SessionEngine.prototype.onMessageReceived = function (message) {
    return false;
};

SessionEngine.prototype.onRouteMessage = function (connectionId, message) {

    logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT,'Received message: ', message);
    
};

SessionEngine.prototype.onErrorResponse = function (message) {
    logger.log(constants.LOG_CATEGORY_ERROR,'Received error response:', message);
};

SessionEngine.prototype.__defineGetter__('sessionActive', function () {
    return this._sessionActive;
});

module.exports = Session;