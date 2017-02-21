var constants = require('./constants.js');
var logger = require('./logger.js');
var os = require('os');

function Command(name, messageSchema, hidden) {
    var _hidden = typeof hidden !== 'undefined' ? hidden : false;

       this.start = function (logger) {
        
        if (this.onStart) {
            
            try {
                this.onStart(logger);
            }
            catch (exception) {
                var errorMessage = 'Command: ' + this.name + ' threw exception on start.' + os.EOL + exception.stack;
                logger.log(constants.LOG_CATEGORY_ERROR, errorMessage);
            }
        }
    };
    
    this.execute = function (message, configuration, logger) {
        var commandResult = { status: 'success' , message: 'ok', transactionId: message.c.x, value: null };

        if (this.onExecute) {
            
            try {

                if (typeof message.d === typeof undefined) {
                    var errorMessage = 'User data not present in message';
                    logger.log(constants.LOG_CATEGORY_ERROR, errorMessage, message);
                    commandResult.status = 'error';
                    commandResult.message = errorMessage;
                }
                else {
                    var result = this.onExecute(message.d, configuration, logger, message.c, message.h);

                    if (typeof result !== typeof undefined) {
                        if (typeof result.status !== typeof undefined && result.status !== null) {
                            commandResult.status = result.status;
                        }
                        if (typeof result.message !== typeof undefined && result.message !== null) {
                            commandResult.message = result.message;
                        }
                        if (typeof result.value !== typeof undefined) {
                            commandResult.value = result.value;
                        }
                    }
                }

            } catch (exception) {
                var errorMessage = 'Command: ' + this.name + ' threw exception on execute' + os.EOL + exception.stack;
                logger.log(constants.LOG_CATEGORY_ERROR, errorMessage, message);
                commandResult.status = 'error';
                commandResult.message = errorMessage;

            }

        }

        return commandResult;

    };
    
    this.stop = function (logger) {
        if (this.onStop) {
            try {
                this.onStop(logger);
            }
            catch (exception) {
                var errorMessage = 'Command: ' + this.name + ' threw exception on stop ' + os.EOL + exception.stack;
                logger.log(constants.LOG_CATEGORY_ERROR, errorMessage);

            }
        }
    };
    
    this.getId = function () {
        return name;
    };

    this.getMessageDefinition = function () {
        return messageSchema.getMessageDefinition(constants.MESSAGE_CLASS_COMMAND, name, _hidden);
    };
    
    this.createMessage = function () {
        var message = messageSchema.createMessage(constants.MESSAGE_CLASS_COMMAND,name);
        return message;
    }

    // Getter Setters
 
    this.__defineGetter__('name', function () {
        return name;
    });
    
    this.__defineGetter__("messageSchema", function () {
        return messageSchema;
    });
};

module.exports = Command;