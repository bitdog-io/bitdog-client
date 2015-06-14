"use strict";

var ChildProcess = require('child_process');
var EventEmitter = require('events').EventEmitter;

var path = require('path');
var util = require('util');
var configuration = require('./configuration.js');
var webServerPath = path.resolve(__dirname , './admin/webserver.js');
var logger = require('./logger.js');
var constants = require('./constants.js');

function WebProcess () {
    var _childProcess = null;
    var _isStarted = false;
    var _isShuttingDown = false;
    
    EventEmitter.call(this);

    this.start = function () {
        if (!_isStarted && _childProcess == null) {
            _isStarted = true;
            _childProcess = ChildProcess.fork(webServerPath, [], { execArgv: [], cwd: process.cwd() });
            _childProcess.on('error', onError);
            _childProcess.on('message', onMessage.bind(this));
            _childProcess.on('disconnected', onDisconnected);
            
            logger.log(constants.LOG_CATEGORY_PROCESS_EVENT,'Web process started at pid: ' + _childProcess.pid);

            this.sendMessage('start', '');
        }
    };

    this.stop = function () {
        if (_isStarted && _childProcess != null) {
            _childProcess.kill();
        }

    }
    
    this.sendMessage = function(messageName, body) {
        _childProcess.send({ name: messageName, body: body });
    };

    this.__defineGetter__('pid', function () {
        return _childProcess.pid;
    });
    
    function onDisconnected() {
        logger.log(constants.LOG_CATEGORY_PROCESS_EVENT,'Web server process disconnected');
    }

    function onMessage(message) {
        if (typeof message != 'undefined' && typeof message.name != 'undefined') {
            switch (message.name) {
                case 'getStatus':
                    {
                        var bitdog = require('./bitdog.js');
                        this.sendMessage('status', bitdog.getStatus());

                    }
                    break;
                case 'startClient':
                    {
                        var bitdog = require('./bitdog.js');
                        bitdog.start();

                    }
                    break;
            }
        }
    }

    function onError(ex) {
        logger.log(constants.LOG_CATEGORY_ERROR,'Web server process execption: ', ex);
    }

};

util.inherits(WebProcess, EventEmitter);

module.exports = WebProcess;


