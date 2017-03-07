"use strict";
var HashTable = require('./hashtable.js');
var DataPoller = require('./dataPoller.js');
var DataCollector = require('./dataCollector.js');
var DataInterface = require('./dataInterface.js');

function DataManager(session) {
    
    var _dataPollers = new HashTable();
    var _isRunning = false;

    this.add = function (name, messageSchema, intervalMilliseconds, collectCallback, hidden) {

        if (typeof intervalMilliseconds === typeof undefined || intervalMilliseconds === null)
            intervalMilliseconds = -1;

        if (typeof hidden === typeof undefined || hidden === null)
            hidden = false;

        var dataCollector = new DataCollector(name, intervalMilliseconds, messageSchema, hidden);
        dataCollector.onCollect = collectCallback;
        
        var dataPoller = new DataPoller(session, dataCollector);
        _dataPollers.put(dataPoller.getId(), dataPoller);

        return new DataInterface(dataPoller);
    };

    this.start = function () {
        if (!_isRunning) {
            _isRunning = true;
			_dataPollers.each(function (key, dataPoller) 
            {
                dataPoller.start();
            });
        }
    };

    this.stop = function () {
        if (_isRunning) {
            _isRunning = false;
			_dataPollers.each(function (key, dataPoller) {
                dataPoller.stop();
            });
        }
    };
    
    this.updateData = function (dataId) {
        var dataPoller = _dataPollers.get(dataId);

        if (dataPoller != null)
            dataPoller.poll();
    };
    
    // Getter Setters
    this.__defineGetter__('dataCollectors', function () {
        var dataArray = new Array();

        _dataPollers.each(function (key, dataPoller) {
            dataArray.push(dataPoller.dataCollector);
        });
        
        dataArray.copyTo = function (destination) {
            require('./helpers.js').messageDefinitionCopyHeloer(dataArray, destination);
        };
        return dataArray;
    });
	
};

module.exports = DataManager;