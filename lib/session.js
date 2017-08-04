'use strict'

var Client = require('signalr-client-forked').client;
var SignalRConnection = require('./signalRConnection.js').SignalRConnection;
var ProcessConnection = require('./processConnection.js');
var DataManager = require('./dataManager.js');
var CommandManager = require('./commandManager.js');
var SubscriptionManager = require('./subscriptionManager.js');
var Buffer = require('buffer').Buffer;
var EventEmitter = require('events').EventEmitter;
var TransactionTracker = require('./transactionTracker.js');

var util = require('util');
var constants = require('./constants.js');
var logger = require('./logger.js');
var configuration = require('./configuration.js');
var os = require('os');
var getHubUrl = require('./signalRConnection.js').getHubUrl;
var getVideoHubUrl = require('./signalRConnection.js').getVideoHubUrl;
var pair = require('./signalRConnection.js').pair;
var url = require('url');
var https = require('https');
var http = require('http');
var fs = require('fs');



function Session() {
    this._sessionEngine = new SessionEngine();
    this._sessionEngine.on('ready', this.emit.bind(this, 'ready'));
    this._sessionEngine.on('message', this.emit.bind(this, 'message'));
}

util.inherits(Session, EventEmitter);

Session.prototype.start = function () {
    this._sessionEngine.start();
};

Session.prototype.getHubUrl = function (resultCallback, authorizationFailedCallback, errorCallback) {
    getHubUrl(resultCallback, authorizationFailedCallback, errorCallback);
};

Session.prototype.getVideoHubUrl = function (resultCallback, authorizationFailedCallback, errorCallback) {
    getVideoHubUrl(resultCallback, authorizationFailedCallback, errorCallback);
};

Session.prototype.stop = function () {
    this._sessionEngine.stop();
};

Session.prototype.addCommand = function (name, messageSchema, executeCallback, startCallback, stopCallback, hidden) {
    return this._sessionEngine.addCommand(name, messageSchema, executeCallback, startCallback, stopCallback, hidden);
};

Session.prototype.addDataCollector = function (name, messageSchema, intervalMilliseconds, collectCallback, hidden) {
    return this._sessionEngine.addDataCollector(name, messageSchema, intervalMilliseconds, collectCallback, hidden);
};

Session.prototype.addSubscription = function (nodeId, name, mode, consumeCallback) {
    return this._sessionEngine.addSubscription(nodeId, name, mode, consumeCallback);
};

Session.prototype.sendMessage = function (message) {
    return this._sessionEngine.sendMessage(message);
};

Session.prototype.sendCommand = function (destinationNodeId, name, messageSchema, callback, additional) {
    return this._sessionEngine.sendCommand(destinationNodeId, name, messageSchema, callback, additional);
};

Session.prototype.sendData = function (name, messageSchema, callback, additional) {
    return this._sessionEngine.sendData(name, messageSchema, callback, additional);
};

Session.prototype.getStatus = function () {
    return this._sessionEngine.getStatus();
};

Session.prototype.__defineGetter__('sessionActive', function () {
    return this._sessionEngine.sesstionActive;
});


function SessionEngine() {
    var self = this;

    // Private members
    this._sessionActive = false;
    this._connectionActive = false;
    this._bitdog = require('./bitdog.js'); // here because of timing
    this._coreMessageSchemas = require('./coreMessageSchemas.js'); // here because of timing
    this._messageInCount = 0;
    this._messageOutCount = 0;
    this._macAddress = null;
    this._hubAddress = '';
    this._transactionTracker = new TransactionTracker("Cloud");
    
    // Create the command and data managers
    this._dataManager = new DataManager(this);
    this._commandManager = new CommandManager(this);
    this._subscriptionManager = new SubscriptionManager(this);
    
    //this._connection = this.createConnection();
    //this.addCommand('sendConfiguration',  this._coreMessageSchemas.sendConfigurationMessageSchema, this.onSendConfigurationMessage.bind(this));

    // This command will force a data collector to fire 
    this.addCommand('bd-updateData', this._coreMessageSchemas.updateDataMessageSchema, this.onUpdateDataCommand.bind(this), undefined, undefined, true);

    this.addCommand('bd-commandResult', this._coreMessageSchemas.commandResultMessageSchema, function (message, configuration, logger) {
        if (typeof message.result !== typeof undefined && message.result !== null) {
            if (typeof message.result.transactionId !== typeof undefined) {
                if (message.result.status !== 'success') {
                    self._transactionTracker.failed(message.result.transactionId, message.result);
                }
                else {
                    self._transactionTracker.done(message.result.transactionId, message.result);
                }
            }
        }
    }, undefined, undefined, true);
    
    var seconds = configuration.performancePollSeconds;
    
    if (typeof seconds != typeof undefined && seconds != null && seconds != 0) {
        this.addDataCollector('bd-performance', this._coreMessageSchemas.performanceMessageSchema, 1000 * seconds, this.collectPerformance.bind(this), false);
    }
};

util.inherits(SessionEngine, EventEmitter);

SessionEngine.prototype.createConnection = function (callback) {
    
    if (configuration.authKey == '' || configuration.nodeId == '') {
        logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, "Attempting to pair");
        
        pair(function (success) {
            
            if (success == true) {
                logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, "Auto paired successfully");
                
                logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, "Acquiring hub address");
                
                getHubUrl(function (url) {
                    this._hubAddress = url;
                    //logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, "Hub address is " + this._hubAddress);
                    
                    var connection = new SignalRConnection(this._hubAddress);
                    this.attachHandlers(connection);
                    callback(connection);

                }.bind(this), function (error) { logger.log(constants.LOG_CATEGORY_STATUS, 'Authorization key may be invalid, please register this node'); }, function (error) { logger.log(constants.LOG_CATEGORY_ERROR, error); callback(null); })

            } else {
                logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, "Could not auto pair");
                logger.log(constants.LOG_CATEGORY_STATUS, 'To learn how to activate your new node go to https://bitdog.io/activatenode for more information.');

            }
                
   
        }.bind(this), function (error) { logger.log(constants.LOG_CATEGORY_ERROR, error); callback(null); })

    }
    else {
        
        logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, "Acquiring hub address");
        
        getHubUrl(function (url) {
            this._hubAddress = url;
            
            var connection = new SignalRConnection(this._hubAddress);
            this.attachHandlers(connection);
            callback(connection);

        }.bind(this), function (error) { logger.log(constants.LOG_CATEGORY_STATUS, 'Authorization key may be invalid, please register this node'); }, function (error) { logger.log(constants.LOG_CATEGORY_ERROR, error); callback(null); })
    }
}


SessionEngine.prototype.attachHandlers = function (connection) {
    connection.serviceHandlers = {
        
        bound: function () { logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, 'Websocket bound'); },
        connectFailed: function (error) { logger.log(constants.LOG_CATEGORY_ERROR, 'Websocket connect failed: ', error); },
        disconnected: function () { logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, 'Websocket disconnected'); },
        onerror: function (error) { logger.log(constants.LOG_CATEGORY_ERROR, 'Websocket onerror: ', error); },
        bindingError: function (error) { logger.log(constants.LOG_CATEGORY_ERROR, 'Websocket binding error: ', error); },
        reconnecting: function (retry /* { inital: true/false, count: 0} */) {
            logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, 'Websocket retrying: ', retry);
            return true;  /* cancel retry true */
        },
        
        connected: this.onConnected.bind(this),
        connectionLost: this.onConnectionLost.bind(this),
        reconnected: this.onReconnected.bind(this),
        unauthorized: this.onUnauthorized.bind(this),
        messageReceived: this.onMessageReceived.bind(this),
        aborted: this.onAborted.bind(this)
    };
    
    // route message Handler
    connection.on(constants.HUB_NAME, 'routeMessage', this.onRouteMessage.bind(this));
    
    // ErrorResponse Message Handler
    connection.on(constants.HUB_NAME, 'ErrorResponse', this.onErrorResponse.bind(this));
}

SessionEngine.prototype.collectPerformance = function (message, configuration, logger) {
    message.freeMem = os.freemem() / 1024;
    message.uptime = os.uptime();
    message.totalMem = os.totalmem() / 1024;
    message.uptimeProcess = this._bitdog.uptimeProcess;
    
    var loads = os.loadavg();
    message.loadAvg1min = loads[0];
    message.loadAvg5min = loads[1];
    message.loadAvg15min = loads[2];


};

// This function gathers meta data about all commands and data collectors and sends 
// it to the hub for use by other nodes.    
SessionEngine.prototype.startSession = function () {
    
    if (!configuration.shouldSuppressLogo)
        logger.log(constants.LOG_CATEGORY_STATUS,constants.LOGOTXT);
    
    logger.log(constants.LOG_CATEGORY_STATUS, constants.HELLOTXT);
    
    this._commandManager.start();
    this._dataManager.start();
    this._subscriptionManager.start();
    
    this.emit('ready', logger, configuration);
  

};

SessionEngine.prototype.sendSubscriptionMessage = function (nodeId, name) {
    var subscriptionMessage = this._coreMessageSchemas.subscriptionMessageSchema.createMessage(constants.MESSAGE_CLASS_SUBSCRIPTION);
    subscriptionMessage.d.i = nodeId;
    subscriptionMessage.d.n = name;
    return this.sendMessage(subscriptionMessage);
};



SessionEngine.prototype.onUpdateDataCommand = function (message, configuration, logger) {
    this._dataManager.updateData(message.dataId);
};

SessionEngine.prototype.sendConfigurationMessage = function () {
    
    var self = this;
    var index = 0;
    var fileName = null;
    
    // Grab a reference to the data and command executors
    var commands = this._commandManager.commands;
    var dataCollectors = this._dataManager.dataCollectors;
    
    // Create a single array for message schemas.
    var messageSchemas = new Array();
    
    // Copy the message types into a single message schema array
    dataCollectors.copyTo(messageSchemas);
    commands.copyTo(messageSchemas);
    
    // Create a configuration message
    var configurationMessage = this._coreMessageSchemas.configurationMessageSchema.createMessage(constants.MESSAGE_CLASS_CONFIGURATION);
    
    configurationMessage.d.applicationName = this._bitdog.applicationName;
    configurationMessage.d.location = configuration.get(constants.AUTOMATIONS_LOCATION);
    
  
    for (index = 0; index < messageSchemas.length; index++)
        configurationMessage.d.messageSchemas.push(messageSchemas[index]);
    
    // If we haven't already tried to obtain our mac address, do it now.
    if (this._macAddress == null) {
        require('getmac').getMac(function (error, macAddress) {
            self._macAddress = macAddress;
            configurationMessage.d.macAddress = self._macAddress;
            return self.postNodeConfiguration(configurationMessage);
        });
    }
    else {
        configurationMessage.d.macAddress = this._macAddress;
        return self.postNodeConfiguration(configurationMessage);
    }
    
    
};

SessionEngine.prototype.postNodeConfiguration = function (configurationMessage, successCallback, errorCallback) {
    var self = this;
    var port = null;
    var protocol = null;
    
    var request = {
        nodeId: configuration.nodeId,
        authKey: configuration.authKey,
        configuration: JSON.stringify(configurationMessage.d)
    };

    var requestJson = JSON.stringify(request);

    var headers = {
        'Content-Type': 'application/json',
    };

    var parsedUrl = url.parse(constants.CENTRAL_URL + '/realm/saveNodeConfiguration');

    if (parsedUrl.port != null)
        port = parsedUrl.port;
    else {
        if (parsedUrl.protocol == 'http:')
            port = 80;
        else (parsedUrl.protocol == 'https:')
            port = 443;
    }

    var options = {
        host: parsedUrl.hostname,
        port: port,
        path: parsedUrl.pathname,
        method: 'POST',
        headers: headers
    };

    protocol = parsedUrl.protocol == 'https:' ? https : http;

    var request = protocol.request(options, function (response) {
        response.setEncoding('utf-8');

        var responseString = '';

        response.on('data', function (data) {
            responseString += data;
        });

        response.on('end', function () {

            if (this.statusCode == 200 && responseString.length > 1) {
                var resultObject = {};

                try {
                    resultObject = JSON.parse(responseString);
                }
                catch (e) {
                    logger.log(constants.LOG_CATEGORY_STATUS, 'Error parsing JSON from saveNodeConfiguration:', e);
                }

                if (resultObject.Success === true) {
                    logger.log(constants.LOG_CATEGORY_STATUS,'Posted configuration success');
                    if (typeof successCallback !== typeof undefined) {
                        successCallback();
                    }

                    return;
                }

                if (resultObject.Success !== true) {
                    logger.log(constants.LOG_CATEGORY_STATUS, 'Error parsing JSON from saveNodeConfiguration:', resultObject);

                    if (errorCallback)
                        errorCallback('Authorization failed');
                    return;
                }

                logger.log(constants.LOG_CATEGORY_STATUS, 'Unexpected response /realm/saveNodeConfiguration');
                if (errorCallback) {
                    errorCallback('Unexpected response /realm/saveNodeConfiguration');
                }
            }
            else {
               logger.log(constants.LOG_CATEGORY_STATUS, 'Unexpected response from /realm/saveNodeConfiguration. Status code: ' + this.statusCode + ' Response: ' + responseString);
               if (errorCallback) {
                    errorCallback('Unexpected response from /realm/saveNodeConfiguration. Status code: ' + this.statusCode + ' Response: ' + responseString);
                }
            }
        });
    });

    request.on('error', function (e) {
        if (errorCallback)
            errorCallback(e);
    });

    request.write(requestJson);
    request.end();

}


SessionEngine.prototype.sendLogMessage = function (text, args) {
    var logMessage = this._coreMessageSchemas.logMessageSchema.createMessage(constants.MESSAGE_CLASS_LOG);
    return this.sendMessage(logMessage);

};

SessionEngine.prototype.endSession = function () {
    this._commandManager.stop();
    this._dataManager.stop();
    this._subscriptionManager.stop();
    
};


// This function is used to start all of the commands and data collectors.
// Polling timers will start and commands will except messages when this is called.
SessionEngine.prototype.start = function (callback) {
    
    if (this._sessionActive !== true) {
        this._sessionActive = true;
        logger.log(constants.LOG_CATEGORY_STATUS, "Starting connection...");
        this.createConnection(function (connection) {

            if (connection !== null) {
                this._connection = connection;
                this._connection.start();
                this._connectionActive = true;

                if (callback)
                    callback(true);

            } else {
                this._sessionActive = false;

                if(callback)
                    callback(false);

            }

        }.bind(this));
       
    }
};



// This function stops all commands and data collectors
// Polling timers will be stopped and commands will not except messages.
SessionEngine.prototype.stop = function () {
    if (this._sessionActive && this._connection != null) {
        this._sessionActive = false;
        this._connectionActive = false;
        this.endSession();
        this._connection.stop();
        this._connection = null;
    }
};

SessionEngine.prototype.addCommand = function (name, messageSchema, executeCallback, startCallback, stopCallback, hidden) {
    return this._commandManager.add(name, messageSchema, executeCallback, startCallback, stopCallback, hidden);
};

SessionEngine.prototype.addDataCollector = function (name, messageSchema, intervalMilliseconds, collectCallback, hidden) {
    return this._dataManager.add(name, messageSchema, intervalMilliseconds, collectCallback, hidden);
};

SessionEngine.prototype.addSubscription = function (nodeId, name, mode, consumeCallback) {
    var subscription = this._subscriptionManager.add(nodeId, name, mode, consumeCallback);
    this.sendSubscriptionMessage(nodeId, name);
    return subscription;
};

SessionEngine.prototype.sendMessage = function (message, cloudResultCallback) {
    var result = true;
    
    if (this._sessionActive === true && this._connectionActive === true) {
        logger.log(constants.LOG_CATEGORY_MESSAGE, 'Sending cloud ' + Buffer.byteLength(JSON.stringify(message), 'utf8') + ' byte message: ', message);
         this._connection.call(constants.HUB_NAME, 'RouteMessage', message)
     	.done(function (err, resultMessage) {
            if ((typeof err === typeof undefined || err === null) && (typeof cloudResultCallback !== typeof undefined && cloudResultCallback !== null)) {
                cloudResultCallback(resultMessage);
            }
 	
        });
        
        this._messageOutCount++;
        
        result = true;
    } else {
        
        result = false;
    }
    
    this.emit('message', message);
    
    return result;
};


SessionEngine.prototype.sendCommand = function (destinationNodeId, name, messageSchema, callback, additional) {
    var self = this;
    var message = messageSchema.createMessage(constants.MESSAGE_CLASS_COMMAND);
    message.h.d = destinationNodeId;
    message.h.n = name;
    
    if (typeof additional !== typeof undefined && additional != null)
        message.h.a = additional;
    
    if (callback)
        callback(message.d);
    
    return new Promise(function (resolve, reject) {
        self.sendMessage(message, function (result) {
            
            if (name === 'bd-commandResult') {
                resolve(result);
            } else {
                
                self._transactionTracker.new(result.TransactionId, function (transactionId, state, context, transactionResult, duration) {
                    var description = { transactionId: transactionId, state: state, context: context, result: transactionResult, duration: duration };
                    
                    switch (state) {
                        case 'expired':
                            logger.log(constants.LOG_CATEGORY_MESSAGE, 'Finished expired cloud call ' + context.h.n + ' id:' + transactionId + ' lasted ' + duration + ' milliseconds');
                            reject(description);
                            break;
                        case 'failed':
                            logger.log(constants.LOG_CATEGORY_MESSAGE, 'Finished failed cloud call ' + context.h.n + ' id:' + transactionId + ' lasted ' + duration + ' milliseconds');
                            reject(description);
                            break;
                        case 'done':
                            logger.log(constants.LOG_CATEGORY_MESSAGE, 'Finished cloud call ' + context.h.n + ' id:' + transactionId + ' lasted ' + duration + ' milliseconds');
                            resolve(description);
                            break;
                    }

                }, message);
            }
        });
    });
    
};

SessionEngine.prototype.sendData = function (name, messageSchema, callback, additional) {
    var message = messageSchema.createMessage(constants.MESSAGE_CLASS_DATA);
    message.h.n = name;

    if (typeof additional !== typeof undefined && additional != null)
        message.h.a = additional;
    
    if (callback)
        callback(message.d);
    
    return this.sendMessage(message);
};

SessionEngine.prototype.sendCommandResult = function (commandResult) {
    this.sendCommand(commandResult.destinationId, 'bd-commandResult', this._coreMessageSchemas.commandResultMessageSchema, function (message) {
        delete commandResult.destinationId;
        message.result = commandResult;
    });
}

SessionEngine.prototype.getStatus = function () {
    return { isConnectionActive: this._connectionActive, isSessionActive: this._sessionActive, messageInCount: this._messageInCount, messageOutCount: this._messageOutCount, hub: constants.CENTRAL_HUB_URL };
};

SessionEngine.prototype.onConnected = function (connection) {
    
    logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, 'Websocket connected');
    this._connectionActive = true;
    this.startSession();
    this.sendConfigurationMessage();
};

SessionEngine.prototype.onConnectionLost = function (error) {
    this.stop();
    logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, 'Websocket lost: ', error);
};

SessionEngine.prototype.onAborted = function (error) {
    var self = this;

    logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, 'Websocket aborted: ', error);
    retry();

    function retry() {
        logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, 'Waiting to restart websocket...');

        setTimeout(function () {

            self.start(function (result) {

                if (result === false) {
                    retry();
                }
            });

        }, 60 * 1000);
    }
};


SessionEngine.prototype.onReconnected = function (connection) {
    this._connectionActive = true;
    logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, 'Websocket reconnected');
    this.sendConfigurationMessage();
};

SessionEngine.prototype.onUnauthorized = function (response) {
    this.stop();
    logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, 'Websocket unauthorized', response.statusCode);
    
    if (configuration.authKey != null && configuration.authKey != '')
        logger.log(constants.LOG_CATEGORY_STATUS, 'Authorization key may be invalid, please register this node');
    
    logger.log(constants.LOG_CATEGORY_STATUS, 'To learn how to activate your new node go to https://bitdog.io/activatenode for more information.');
};

SessionEngine.prototype.onMessageReceived = function (message) {
    this._messageInCount++;
    return false;
};

SessionEngine.prototype.onRouteMessage = function (message) {
    
    logger.log(constants.LOG_CATEGORY_MESSAGE, 'Received message: ', message);
    this.emit('message', message);
    
    if (message.h && message.h.c) {
        switch (message.h.c) {
            case constants.MESSAGE_CLASS_COMMAND:
                var commandResult = this._commandManager.execute(message);
                if(message.h.n !== 'bd-commandResult')
                    this.sendCommandResult(commandResult);
                break;
            case constants.MESSAGE_CLASS_DATA:
                this._subscriptionManager.consume(message);
                break;
            case constants.MESSAGE_CLASS_REGISTRATION:
                this.register(message);
                break;
            default:
                logger.log(constants.LOG_CATEGORY_ERROR, 'Received invalid message class: ' + message.h.c);
                break;
        }

    }
    
};

SessionEngine.prototype.register = function (message) {
    if (!configuration.isRegistered && message.h && message.h.a && message.h.n) {
        configuration.authKey = message.h.a;
        configuration.nodeId = message.h.n;
    } else {
        logger.log(constants.LOG_CATEGORY_ERROR, "Received incomplete registration message: ", message);
    }
}

SessionEngine.prototype.onErrorResponse = function (message) {
    logger.log(constants.LOG_CATEGORY_ERROR, 'Received error response:', message);
};

SessionEngine.prototype.__defineGetter__('sessionActive', function () {
    return this._sessionActive;
});



module.exports = Session;