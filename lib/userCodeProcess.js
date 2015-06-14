"use strict";

var ChildProcess = require('child_process');
var EventEmitter = require('events').EventEmitter;

var path = require('path');
var util = require('util');
var logger = require('./logger.js');
var configuration = require('./configuration.js');
var constants = require('./constants.js');
var userCodeServerPath = path.resolve(__dirname , './userCode/userCodeServer.js');

function UserCodeProcess () {
    var _childProcess = null;
    var _isStarted = false;
    var _isShuttingDown = false;
    
    EventEmitter.call(this);

    this.start = function () {
        if (!_isStarted && _childProcess == null) {
            _isStarted = true;
            _childProcess = ChildProcess.fork(userCodeServerPath, [], { execArgv: [], cwd: process.cwd(), silent: false });
            _childProcess.on('error', onError);
            _childProcess.on('message', onMessage.bind(this));
            _childProcess.on('disconnected', onDisconnected);
            
            logger.log(constants.LOG_CATEGORY_PROCESS_EVENT,'User code process started at pid: ' + _childProcess.pid);

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
        logger.log(constants.LOG_CATEGORY_PROCESS_EVENT, 'User code process disconnected');
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
            }
        }
    }

    function onError(ex) {
        logger.log(constants.LOG_CATEGORY_ERROR,'User code process execption: ', ex);
    }

};

util.inherits(UserCodeProcess, EventEmitter);

module.exports = UserCodeProcess;


