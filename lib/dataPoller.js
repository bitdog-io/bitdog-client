"use strict";

function DataPoller (session, dataCollector) {
    // Private members
    var _timerHandle = 0;

    // Public methods
    this.getId = function () {
        return dataCollector.getId();
    };
    
    this.start = function () {
        dataCollector.start();
        
        if(dataCollector.intervalMilliseconds >= 1)
            _timerHandle = setInterval(this.update, dataCollector.intervalMilliseconds);
    };
    
    this.stop = function () {
        if (_timerHandle != 0) {
            clearTimeout(_timerHandle);
            _timerHandle = 0;
            dataCollector.stop();
        }
    };
    
    this.update = function () {
        //Get the data the user would like to send
        var message = dataCollector.collect();
        
        //Send message
        session.sendMessage(message);
    };

    this.__defineGetter__("dataCollector", function () {
        return dataCollector;
    });
};

module.exports = DataPoller;