'use strict';
var HashTable = require('./hashtable.js');
var Subscription = require('./subscription.js');

function SubscriptionManager(session){
    
    var _isRunning = false;
    var _subscriptions = new HashTable();
    
    this.start = function () {
        if (!_isRunning) {
            _isRunning = true;

            _subscriptions.each(function (key, subscription) {
                session.sendSubscriptionMessage(subscription.nodeId,subscription.name);
            });
        }
    };
    
    this.stop = function () {
        if (_isRunning) {
            _isRunning = false;
        }
    };
    
    this.consume = function (message) {
        if (_isRunning) {
            _subscriptions.each(function (key,subscription) { 
                subscription.consume(message);
            });
        }
    };

    this.add = function (nodeId, name, mode, consumeCallback) {

        var subscription = new Subscription(nodeId, name, mode);
        
		if (consumeCallback) {
			subscription.onConsume = consumeCallback;
		}
        _subscriptions.put(subscription.getId(), subscription);

        return subscription;
    };
};

module.exports = SubscriptionManager;