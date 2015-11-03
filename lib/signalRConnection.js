'use strict';

var EventEmitter = require('events').EventEmitter;
var Connection = require('./connection.js');
var Client = require('signalr-client').client;

var util = require('util');
var constants = require('./constants.js');
var configuration = require('./configuration.js');

function SignalRConnection() {
    Connection.call(this);
    this._client = new Client(constants.CENTRAL_HUB_URL, [constants.HUB_NAME], 10, true);

}

util.inherits(SignalRConnection, Connection);

SignalRConnection.prototype.onServiceHandlersChanged = function () {
    this._client.serviceHandlers = this.serviceHandlers;
};

SignalRConnection.prototype.on = function (hub, method, callback) {
    this._client.on(hub, method, callback);
};

SignalRConnection.prototype.invoke = function (hub, methodName, args) {
    this._client.invoke(hub, methodName, args);
};

SignalRConnection.prototype.start = function () {
    var headers = {};
    headers[constants.AUTH_KEY_NAME] = configuration.authKey;
    headers[constants.NODE_ID] = configuration.nodeId;
    this._client.headers = headers;

    this._client.start();
};

SignalRConnection.prototype.stop = function () {
    this._client.end();
};

SignalRConnection.prototype.getHubUrl = function () {

};

module.exports = SignalRConnection;