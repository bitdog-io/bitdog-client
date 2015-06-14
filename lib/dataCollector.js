'use strict';
var constants = require('./constants.js');
var logger = require('./logger.js');
var configuration = require('./configuration.js');
var os = require('os');

function DataCollector(name, intervalMilliseconds, messageSchema) {
    
    // Public methods
    this.start = function () {
        if (this.onStart) {
            try {
                this.onStart();
            }
            catch (exception) {
                var errorMessage = 'Data collector: ' + this.name + ' threw exception on start.' + os.EOL + exception.stack;
                logger.log(constants.LOG_CATEGORY_ERROR, errorMessage);

            }
        }
    };

    this.getId = function () {
        return this.name;
    };

    this.collect = function () {
        var message = this.createMessage();
        
        try {
            this.onCollect(message.d, configuration, logger);
        }
        catch (exception) {
            var errorMessage = 'Data collector: ' + this.name + ' threw exception on collect.' + os.EOL + exception.stack;
            logger.log(constants.LOG_CATEGORY_ERROR, errorMessage);
        }

        return message;
    };

    this.stop = function () {
        if (this.onStop) {
            try {
                this.onStop();
            }
            catch (exception) {
                var errorMessage = 'Data collector: ' + this.name + ' threw exception on stop.' + os.EOL + exception.stack;
                logger.log(constants.LOG_CATEGORY_ERROR, errorMessage);

            }
        }
    };
    
    this.getMessageDefinition = function () {
        return messageSchema.getMessageDefinition(constants.MESSAGE_CLASS_DATA, name);
    };

    this.createMessage = function () {
        return messageSchema.createMessage(constants.MESSAGE_CLASS_DATA, name);
    }
    
    // Getter Setters

    this.__defineGetter__('name', function () {
        return name;
    });

    this.__defineGetter__('intervalMilliseconds', function () {
        return intervalMilliseconds;
    });

    this.__defineGetter__('messageSchema', function () {
        return messageSchema;
    });


};

module.exports = DataCollector;