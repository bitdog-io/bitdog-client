var util = require('util');
var constants = require('./constants.js');

function Connection() {
    this._serviceHandlers = {};
}

Connection.prototype.start = function () {
    
};

Connection.prototype.stop = function () {

};

Connection.prototype.mergeFrom = function (target, source) {
    
    if (source) {
        for (var propName in source) {
            target[propName] = source[propName];
        }
    }

};

Connection.prototype.onServiceHandlersChanged = function () {

};

Connection.prototype.on = function (hub, method, callback) {

};

Connection.prototype.invoke = function (hub, methodName, args) {

};

Connection.prototype.__defineSetter__('serviceHandlers', function (value) {
    this.mergeFrom(this._serviceHandlers, value);
    this.onServiceHandlersChanged();
});

Connection.prototype.__defineGetter__('serviceHandlers', function () {
    return this._serviceHandlers;
});

module.exports = Connection;