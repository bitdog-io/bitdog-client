'use strict';
var Pattern = require('jsr-pattern');
var configuration = require('./configuration.js');
var logger = require('./logger.js');

function Subscription(nodeId, name, mode) {
    
    var _nodeIdRegExp = new Pattern().compile(nodeId== null ? '' : nodeId);
    var _nameRegExp = new Pattern().compile(name);

    function match(message) {
        
        if ((!message.h.d || _nodeIdRegExp.test(message.h.d)) && _nameRegExp.test(message.h.n) ) {
            return true;
		}

        return false;
    }
    
    this.getId = function () {
        return nodeId + '-' + name;
    };

    this.consume = function (message) {
        var self = this;
		if (this.onConsume && match(message)) {
			setImmediate(function () { self.onConsume(message.d, configuration, logger); });
		}
    };

     this.__defineGetter__('name', function () {
        return name;
    });

    this.__defineGetter__('nodeId', function () {
        return nodeId;
    });

    this.__defineGetter__('mode', function () {
        return mode;
    });

}

module.exports = Subscription;
