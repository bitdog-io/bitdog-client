![](http://s.gravatar.com/avatar/d1004ac0d5f3456f6909f9933e2980ec?s=80)  

# Bitdog client implementation for Node.js

### We are currently in alpha testing of our client API and cloud services. If you would like to be a volunteer tester/integrator, send an email to vjm@bitdog.io.  The documentation below is a work in progress.


[![npm version](https://badge.fury.io/js/bitdog-client.svg)](http://badge.fury.io/js/bitdog-client)

[![NPM](https://nodei.co/npm/bitdog-client.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/bitdog-client/)

[![NPM](https://nodei.co/npm-dl/bitdog-client.png?height=3)](https://nodei.co/npm/bitdog-client/)

[![GitHub version](https://badge.fury.io/gh/bitdog-io%2Fbitdog-client.png)](http://badge.fury.io/gh/bitdog-io%2Fbitdog-client)


# Overview
Bitdog is a simple to use collection of Node.js API, mobile apps, and cloud based tools that allows IoT hobbyists and inventors to control and monitor any device that can run Node.js. With as little as ten lines of code, you can start monitoring sensors and controlling devices.  Create an account at https://bitdog.io and start your IoT project today.

# API Documentation

## bitdog-client

### addCommand(name, messageSchema, executeCallback [,startCallback][,stopCallback])

This function can wrap any code and make it callable from any Bitdog web or mobile application.
 
	// Retrieve the bitdog-client interface
	var bitdog = require('bitdog-client');

	// Create a command with a common message schema
	bitdog.addCommand('Turn light on/off',
	bitdog.commonMessageSchemas.onOffMessageSchema,
	function (message, configuration, logger) {

    	// Every time this command is received, we will simply log the fact
    	logger.log('User', 'Got command: turn light ' + message.value);

	});

### addDataCollector(name, messageSchema, intervalMilliseconds, collectCallback)

This function creates a timer that will invoke code at a set interval and collect data to be sent back to Bitdog Cloud. The data sent back can be used to create graphs and charts or be used as input to an automation orchestration. 

	// Retrieve the bitdog-client interface
	var bitdog = require('bitdog-client');

	// Create a new data collector for our position sensor
    var positionDataCollector = bitdog.addDataCollector('Position', 
	bitdog.commonMessageSchemas.mapPositionMessageSchema ,
	10000, 
	function (message, configuration, logger) {
    
	    // Instead of collecting real data, we are just sending random data
	    // for this example
	    message.latitude = Math.floor((Math.random() * 100) + 1);
	    message.longitude = Math.floor((Math.random() * 100) + 1);
       
    });

### addQuestion(questionText,answerText)

This function registers a text question and its answer with Bitdog Cloud.The question will be added to the voice recognition index. Users of Bitdog mobile apps can simply speak their question to their mobile device. The Bitdog mobile app will find the best matching answer to their question and read it back to them via text-to-speech. 

	// Retrieve the bitdog-client interface
	var bitdog = require('bitdog-client');

	// Create a new question and answer
    bitdog.addQuestion('How many lights are on', 'There are two lights on');
    


### createMessageSchema(name)

Data used for Bitdog data collectors and commands can be of nearly any shape and type. This function creates custom message schemas.

	// Retrieve the bitdog-client interface
	var bitdog = require('bitdog-client');

	// Create a message schema called MySchema
    var messageSchema = bitdog.createMessageType('MySchema')
			// Add a number property to hold a value
			// Set the default value to zero
            .addNumberProperty('waterlevel', 0)
			// Add a string property to hold text
			// Set the default value to empty string
            .addStringProperty('log','');


### Event: 'ready'
Emitted after the start method is called and the bitdog-client as able to connect to the Bitdog Cloud and exchange credentials.

	// Retrieve the bitdog-client interface
	var bitdog = require('bitdog-client');
	
	// When the connection is ready
    bitdog.on('ready', function (logger, configuration) {
    
	    setInterval(function () {
		    isOn = !isOn;

		    bitdog.sendCommand('8d5ba206-97b4-4fdc-bc81-0365cc660afe',
								'Turn light on/off',
							 	bitdog.commonMessageSchema.onOffMessageSchema,
								function (message) {
		    						message.value = isOn ? 'off' : 'on';
	    						});
    
    							}, 15000);
      
    });

	bitdog.start();

### start()

This function starts a connection with the Bitdog Cloud service and starts data collection. Once the connection is started any submitted commands will be executed by the node.

    // Retrieve the bitdog-client interface
	var bitdog = require('bitdog-client');

	bitdog.start();

	### stop()

	// Retrieve the bitdog-client interface
	var bitdog = require('bitdog-client');

	// When the connection is ready
    bitdog.on('ready', function (logger, configuration) {
    
		// Now that we are connected, let's stop
		bitdog.stop();
      
    });

	bitdog.start();

## MessageSchema
Message schema defines the what kind of data is contained in a message payload.

### addNumberProperty(name, defaultValue [,limits])
This function adds a number property to the message schema.

### addStringProperty(name, defaultValue [,limits])
This function adds a string property to the message schema.

### addDateTimeProperty(name, defaultValue [,limits])
This function adds a datetime property to the message schema.

### addArrayProperty(name, defaultValue [,limits])
This function adds an array property to the message schema.

### addObjectProperty(name, defaultValue [,limits])
This function adds an object property to the message schema. 
	
## commonMessageSchemas
### rotationMessageSchema
### valueMessageSchema
### textMessageSchema
### onOffMessageSchema
### mapPositionMessageSchema
### positionMessageSchema

## Example

    // Retrieve the bitdog-client interface
    var bitdog = require('bitdog-client');
    var isOn = false;
    
    // Create a command with a common message schema
    bitdog.addCommand('Turn light on/off',
	bitdog.commonMessageTypes.onOffMessageSchema,
	function (message, configuration, logger) {
    
	    // Every time this command is received, we will simply log the fact
	    logger.log('User', 'Got command: turn light ' + message.value);
    
    });
    
    
    // Create a new data collector for our position sensor
    var positionDataCollector = bitdog.addDataCollector('Position', 
	bitdog.commonMessageSchema.mapPositionMessageSchema ,
	10000, 
	function (message, configuration, logger) {
    
	    // Instead of collecting real data, we are just sending random data
	    // for this example
	    message.latitude = Math.floor((Math.random() * 100) + 1);
	    message.longitude = Math.floor((Math.random() * 100) + 1);
       
    });
    
    // Create a new question and answer
    bitdog.addQuestion('How many lights are on', 'There are two lights on');
    
	// Create a new subscription
	bitdog.addSubscription('*',
							'Position',
							function (message, configuration, logger) {
	    						logger.log('User','Message consumed', message);
    						});
    
    
    // When the connection is ready
    bitdog.on('ready', function (logger, configuration) {
    
	    setInterval(function () {
		    isOn = !isOn;

		    bitdog.sendCommand('8d5ba206-97b4-4fdc-bc81-0365cc660afe',
								'Turn light on/off',
							 	bitdog.commonMessageSchema.onOffMessageSchema,
								function (message) {
		    						message.value = isOn ? 'off' : 'on';
	    						});
    
    							}, 15000);
      
    });
    
    // Start that connection and watch the messages
    bitdog.start();
    
## Installation

### Embedded
### Agent based

## Configuration

### ./bin/config.json


  



