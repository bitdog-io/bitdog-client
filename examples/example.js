"use strict";

// Retrieve the bitdog interface
var bitdog = require('../lib/bitdog.js');
var isOn = false;

// Create a command with our message type
bitdog.addCommand('Turn light on/off',  bitdog.commonMessageSchemas.onOffMessageSchema, function (message, configuration, logger) {
    
    // Every time this command is received, we will simply log the fact
    logger.log('User', 'Got command: turn light ' + message.value);

});


// Create a new data collector for our position sensor
var positionDataCollector = bitdog.addDataCollector('Position', bitdog.commonMessageSchemas.mapPositionMessageSchema , 10000, function (message, configuration, logger) {
    
    // Instead of collecting real data, we are just sending random data
    // for this test
    message.latitude = Math.floor((Math.random() * 100) + 1);
    message.longitude = Math.floor((Math.random() * 100) + 1);
   
});

// Create a new question and answer  
bitdog.addQuestion('How many lights are on', 'There are two lights on');

// Create a new subscription
bitdog.addSubscription('*', 'Position', 'add', function (message, configuration, logger) {
    logger.log('User','Message consumed', message);
});


// When the connection is ready
bitdog.on('ready', function (logger, configuration) {
    
    setInterval(function () {
        isOn = !isOn;
        bitdog.sendCommand('6d0c726b-b60e-4e6f-b8e0-2d76109c5527', 'Turn light on/off', bitdog.commonMessageSchemas.onOffMessageSchema, function (message) {
            message.value = isOn ? 'off' : 'on';
        });


    }, 15000);
  
});

// Start that connection and watch the messages
bitdog.start();


