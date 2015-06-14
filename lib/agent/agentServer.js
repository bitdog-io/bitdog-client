"use strict";

var Session = require('./session.js');

var logger = require('../logger.js');
var constants = require('../constants.js');


function AgentServer() {
    var session = new Session();
    logger.log(constants.LOG_CATEGORY_STATUS, 'Agent process started at pid: ' + process.pid);
    session.start();
}

function exitHandler(options, err) {
    logger.log(constants.LOG_CATEGORY_STATUS,'Agent stopping');
    if (err) logger.log(constants.LOG_CATEGORY_ERROR,err.stack);
    if (options.exit) process.exit();
}

process.on('exit', exitHandler.bind(null, { cleanup: true }));  
process.on('beforeExit', exitHandler.bind(null, { cleanup: true }));
process.on('SIGTERM', exitHandler.bind(null, { exit: true }));   
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));

module.exports = AgentServer();