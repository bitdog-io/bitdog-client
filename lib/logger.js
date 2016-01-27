"use strict"; 
var configuration = require('./configuration.js');
var os = require('os');
var moment = require('moment');
var constants = require('./constants.js');

function Logger() {

	// Diagnostic logging handler
    this.log = function (category, text, arg) {
        
        if (this.shouldLog(category)) {
             
            if (arg) {
                text = text + os.EOL + JSON.stringify(arg, null, 2);
            }

            console.log(moment().format() + ' ' + category + ': ' + text);
        }
       
        
    };
    
    this.logMessage = function (text, arg) {
        this.log(constants.LOG_CATEGORY_MESSAGE, text, arg);
    };
    
    this.logProcessEvent = function (processName, text, arg) {
        this.log(constants.LOG_CATEGORY_PROCESS_EVENT,processName + ' ' + text, arg);
    };


    this.shouldLog = function (category) {
        switch (category) {
            case constants.LOG_CATEGORY_MESSAGE:
                return configuration.shouldLogMessages;
            case constants.LOG_CATEGORY_PROCESS_EVENT:
                return configuration.shouldLogProcessEvents;
            case constants.LOG_CATEGORY_CONNECTION_EVENT:
                return configuration.shouldLogConnectionEvents;
            default:
                return true;

        }
    };
}

module.exports = new Logger();