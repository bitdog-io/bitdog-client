'use strict';

var EventEmitter = require('events').EventEmitter;
var Connection = require('./connection.js');
var Client = require('signalr-client-forked').client;

var util = require('util');
var constants = require('./constants.js');
var configuration = require('./configuration.js');
var https = require('https');
var http = require('http');
var url = require('url');
var logger = require('./logger.js');


function SignalRConnection(url) {
    Connection.call(this);
    this._client = new Client(url, [constants.HUB_NAME], 10, true);
}

util.inherits(SignalRConnection, Connection);

SignalRConnection.prototype.onServiceHandlersChanged = function () {
    this._client.serviceHandlers = this.serviceHandlers;
};

SignalRConnection.prototype.on = function (hub, method, callback) {
    this._client.on(hub, method, callback);
};

SignalRConnection.prototype.invoke = function (hub, methodName, args) {
    return this._client.invoke(hub, methodName, args);
};

SignalRConnection.prototype.call = function (hub, methodName, args) {
    return this._client.call(hub, methodName, args);
};

SignalRConnection.prototype.start = function () {
    var headers = {};
    headers[constants.AUTH_KEY_NAME] = configuration.authKey;
    headers[constants.NODE_ID] = configuration.nodeId;
    this._client.headers = headers;
    
    this._client.start();
 
};

SignalRConnection.prototype.stop = function () {
    this._client.end();
};

function getHubUrl(resultCallback, authorizationFailedCallback, errorCallback) {
    var self = this;
    var port = null;
    var protocol = null;
    
    var request = {
        nodeId: configuration.nodeId,
        authKey: configuration.authKey
    };
    
    var requestJson = JSON.stringify(request);
    
    var headers = {
        'Content-Type': 'application/json',
    };
    
    var parsedUrl = url.parse(constants.CENTRAL_URL + constants.HUB_GETURL_PATH);
    
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
                    logger.log(constants.LOG_CATEGORY_ERROR, 'Error parsing JSON:', e);
                }
                
                if (resultObject.Success && resultObject.HubUrl) {
                    var hubUrl = resultObject.HubUrl.replace("https://", "wss://");
                    if (resultCallback) {
                        resultCallback(hubUrl);
                    }
                    
                    return;
                }
                
                if (!resultObject.Success) {
                    if (authorizationFailedCallback) 
                        authorizationFailedCallback('Authorization failed');
                    return;
                }

                if (errorCallback)
                    errorCallback('Unexpected response from get hub url request');
               
            }
            else {
                if (errorCallback)
                    errorCallback('Unexpected response from get hub url request. Status code: ' + this.statusCode + ' Response: ' + responseString);
            }
        });
    });
    
    request.on('error', function (e) {
        if (errorCallback)
            errorCallback(e);
    });
    
    request.write(requestJson);
    request.end();
 
};

function getVideoHubUrl(resultCallback, authorizationFailedCallback, errorCallback) {
    var self = this;
    var port = null;
    var protocol = null;
    
    var request = {
        nodeId: configuration.nodeId,
        authKey: configuration.authKey
    };
    
    var requestJson = JSON.stringify(request);
    
    var headers = {
        'Content-Type': 'application/json',
    };
    
    var parsedUrl = url.parse(constants.CENTRAL_URL + constants.HUB_GETVIDEOURL_PATH);
    
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
                    logger.log(constants.LOG_CATEGORY_ERROR, 'Error parsing JSON:', e);
                }
                
                if (resultObject.Success && resultObject.HubUrl) {
                    var hubUrl = resultObject.HubUrl.replace("https://", "wss://");
                    if (resultCallback) {
                        resultCallback(hubUrl);
                    }
                    
                    return;
                }
                
                if (!resultObject.Success) {
                    if (authorizationFailedCallback)
                        authorizationFailedCallback('Authorization failed');
                    return;
                }
                
                if (errorCallback)
                    errorCallback('Unexpected response from get hub url request');
               
            }
            else {
                if (errorCallback)
                    errorCallback('Unexpected response from get hub url request. Status code: ' + this.statusCode + ' Response: ' + responseString);
            }
        });
    });
    
    request.on('error', function (e) {
        if (errorCallback)
            errorCallback(e);
    });
    
    request.write(requestJson);
    request.end();
 
};

function getFileAssetUrl(resultCallback, authorizationFailedCallback, errorCallback) {
    var self = this;
    var port = null;
    var protocol = null;
    
    var request = {
        nodeId: configuration.nodeId,
        authKey: configuration.authKey
    };
    
    var requestJson = JSON.stringify(request);
    
    var headers = {
        'Content-Type': 'application/json',
    };
    
    var parsedUrl = url.parse(constants.CENTRAL_URL + constants.HUB_GETFILEASSETURL_PATH);
    
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
                    logger.log(constants.LOG_CATEGORY_ERROR, 'Error parsing JSON:', e);
                }
                
                if (resultObject.Success && resultObject.HubUrl) {
                    var hubUrl = resultObject.HubUrl;
                    if (resultCallback) {
                        resultCallback(hubUrl);
                    }
                    
                    return;
                }
                
                if (!resultObject.Success) {
                    if (authorizationFailedCallback)
                        authorizationFailedCallback('Authorization failed');
                    return;
                }
                
                if (errorCallback)
                    errorCallback('Unexpected response from get file asset url request');
               
            }
            else {
                if (errorCallback)
                    errorCallback('Unexpected response from get file asset url request. Status code: ' + this.statusCode + ' Response: ' + responseString);
            }
        });
    });
    
    request.on('error', function (e) {
        if (errorCallback)
            errorCallback(e);
    });
    
    request.write(requestJson);
    request.end();
 
};

function pair(resultCallback, errorCallback) {
    var self = this;
    var port = null;
    var protocol = null;
    
    var request = {
    };
    
    var requestJson = JSON.stringify(request);
    
    var headers = {
        'Content-Type': 'application/json',
    };
    
    var parsedUrl = url.parse(constants.CENTRAL_URL + constants.PAIR_PATH);
    
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
                    logger.log(constants.LOG_CATEGORY_ERROR, 'Error parsing JSON:', e);
                }
                
                if (resultObject.Paired == true && resultObject.NodeId && resultObject.AuthKey) {
                    
                    configuration.nodeId = resultObject.NodeId;
                    configuration.authKey = resultObject.AuthKey;

                    if (resultCallback) {
                        resultCallback(true);
                    }
                    
                    return;
                }
                
                if (resultObject.Paired == false) {
                    if (resultCallback)
                        resultCallback(false);
                    return;
                }
                
                if (errorCallback)
                    errorCallback('Unexpected response from get hub url request');
               
            }
            else {
                if (errorCallback)
                    errorCallback('Unexpected response from get hub url request. Status code: ' + this.statusCode + ' Response: ' + responseString);
            }
        });
    });
    
    request.on('error', function (e) {
        if (errorCallback)
            errorCallback(e);
    });
    
    request.write(requestJson);
    request.end();
 
};

module.exports.SignalRConnection = SignalRConnection;
module.exports.getHubUrl = getHubUrl;
module.exports.getVideoHubUrl = getVideoHubUrl;
module.exports.getFileAssetUrl = getFileAssetUrl;
module.exports.pair = pair;