'use strict'

var Client = require('signalr-client-forked').client;
var SignalRConnection = require('./signalRConnection.js').SignalRConnection;
var ProcessConnection = require('./processConnection.js');
var DataManager = require('./dataManager.js');
var CommandManager = require('./commandManager.js');
var SubscriptionManager = require('./subscriptionManager.js');
var Buffer = require('buffer').Buffer;
var EventEmitter = require('events').EventEmitter;

var util = require('util');
var constants = require('./constants.js');
var logger = require('./logger.js');
var configuration = require('./configuration.js');
var os = require('os');
var getHubUrl = require('./signalRConnection.js').getHubUrl;
var pair = require('./signalRConnection.js').pair;


function Session() {
    this._sessionEngine = new SessionEngine();
    this._sessionEngine.on('ready', this.emit.bind(this, 'ready'));
    this._sessionEngine.on('message', this.emit.bind(this, 'message'));
}

util.inherits(Session, EventEmitter);

Session.prototype.start = function () {
    this._sessionEngine.start();
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

Session.prototype.makeRequest = function (name, messageSchema, parameters) {
    return this._sessionEngine.makeRequest(name, messageSchema, parameters);
};

Session.prototype.getStatus = function () {
    return this._sessionEngine.getStatus();
};

Session.prototype.__defineGetter__('sessionActive', function () {
    return this._sessionEngine.sesstionActive;
});


function SessionEngine() {
    // Private members
    this._sessionActive = false;
    this._connectionActive = false;
    this._bitdog = require('./bitdog.js'); // here because of timing
    this._coreMessageSchemas = require('./coreMessageSchemas.js'); // here because of timing
    this._messageInCount = 0;
    this._messageOutCount = 0;
    this._macAddress = null;
    this._hubAddress = '';
    
    // Create the command and data managers
    this._dataManager = new DataManager(this);
    this._commandManager = new CommandManager(this);
    this._subscriptionManager = new SubscriptionManager(this);
    
    //this._connection = this.createConnection();
    //this.addCommand('sendConfiguration',  this._coreMessageSchemas.sendConfigurationMessageSchema, this.onSendConfigurationMessage.bind(this));
    
    this.addCommand('bd-updateData', this._coreMessageSchemas.updateDataMessageSchema, this.onUpdateDataCommand.bind(this), undefined, undefined, true);
    
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
                    logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, "Hub address is " + this._hubAddress);
                    
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
            logger.log(constants.LOG_CATEGORY_CONNECTION_EVENT, "Hub address is " + this._hubAddress);
            
            var connection = new SignalRConnection(this._hubAddress);
            this.attachHandlers(connection);
            callback(connection);

        }.bind(this), function (error) { logger.log(constants.LOG_CATEGORY_STATUS, 'Authorization key may be invalid, please register this node'); }, function (error) { logger.log(constants.LOG_CATEGORY_ERROR, error); })
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
        logger.log(constants.LOGOTXT);
    
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
    
    for (var index = 0; index < messageSchemas.length; index++)
        configurationMessage.d.messageSchemas.push(messageSchemas[index]);
    
    // If we haven't already tried to obtain our mac address, do it now.
    if (this._macAddress == null) {
        require('getmac').getMac(function (error, macAddress) {
            self._macAddress = macAddress;
            configurationMessage.d.macAddress = self._macAddress;
            return self.sendMessage(configurationMessage);
        });
    }
    else {
        configurationMessage.d.macAddress = this._macAddress;
        return this.sendMessage(configurationMessage);
    }
    
    
};

//SessionEngine.prototype.onSendConfigurationMessage = function (message, configuration, logger) {

//    var self = this;
//    // Grab a reference to the data and command executors
//    var commands = this._commandManager.commands;
//    var dataCollectors = this._dataManager.dataCollectors;

//    // Create a single array for message schemas.
//    var messageSchemas = new Array();

//    // Copy the message types into a single message schema array
//    dataCollectors.copyTo(messageSchemas);
//    commands.copyTo(messageSchemas);

//    // Create a configuration message
//    var configurationMessage = this._coreMessageSchemas.configurationMessageSchema.createMessage(constants.MESSAGE_CLASS_CONFIGURATION);

//    for (var index = 0; index < messageSchemas.length; index++)
//        configurationMessage.d.messageSchemas.push(messageSchemas[index]);

//    // If we haven't already tried to obtain our mac address, do it now.
//    if (this._macAddress == null) {
//        require('getmac').getMac(function (error, macAddress) {
//            self._macAddress = macAddress;
//            configurationMessage.d.macAddress = self._macAddress;
//            self.sendMessage(configurationMessage);
//        });
//    }
//    else {
//        configurationMessage.d.macAddress = this._macAddress;
//        this.sendMessage(configurationMessage);
//    }


//};

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

SessionEngine.prototype.sendMessage = function (message) {
    var result = false;
    
    if (this._sessionActive === true && this._connectionActive === true) {
        result = this._connection.invoke(constants.HUB_NAME, 'RouteMessage', message);
        this._messageOutCount++;
        logger.log(constants.LOG_CATEGORY_MESSAGE, 'Sent ' + Buffer.byteLength(JSON.stringify(message), 'utf8') + ' byte message: ', message);
        
    }
    
    this.emit('message', message);
    
    return result;
};

SessionEngine.prototype.makeRequest = function (name, messageSchema, parameters) {
    var message = messageSchema.requestMessageSchema.createMessage(constants.MESSAGE_CLASS_REQUEST);
    message.h.n = name;
    message.d.p = parameters;
    
    
    return this.sendMessage(message);

};

SessionEngine.prototype.sendCommand = function (destinationNodeId, name, messageSchema, callback, additional) {
    var message = messageSchema.createMessage(constants.MESSAGE_CLASS_COMMAND);
    message.h.d = destinationNodeId;
    message.h.n = name;
    
    if (additional && additional != null)
        message.h.a = additional;
    
    if (callback)
        callback(message.d);
    
    return this.sendMessage(message);
};

SessionEngine.prototype.sendData = function (name, messageSchema, callback, additional) {
    var message = messageSchema.createMessage(constants.MESSAGE_CLASS_DATA);
    message.h.n = name;
    
    if (additional && additional != null)
        message.h.a = additional;
    
    if (callback)
        callback(message.d);
    
    return this.sendMessage(message);
};

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
                this._commandManager.execute(message);
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