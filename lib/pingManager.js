﻿
function PingManager(session) {
    var configuration = require('./configuration.js');
    var logger = require('./logger.js');
    var constants = require('./constants.js');
    var coreMessageSchemas = require('./coreMessageSchemas.js');

    var _isRunning = false;
    var _timerHandle = setInterval(function () {
        if (_isRunning === true) {
            session.sendCommand(configuration.nodeId, 'bd-ping', coreMessageSchemas.pingMessageSchema, function (message) {
               
            }).then(function (commandResult) {
                logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Received ping response');
     
            }, function (error) {
                logger.logProcessEvent(constants.LOG_PROCESS_AUTOMATION, 'Did not receive ping reponse', error);

            });
        }

    }.bind(this), 60000);

    this.start = function () {
        if (!_isRunning) {
            _isRunning = true;
        }
    };

    this.stop = function () {
        if (_isRunning) {
            _isRunning = false;

            // Stopping the session will cause it to restart
            session.stop();
          }
    };

}

module.exports = PingManager;