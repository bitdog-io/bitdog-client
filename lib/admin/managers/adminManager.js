"use strict";
var logger = require('../../logger.js');
var constants = require('../../constants.js');
var https = require('https');
var http = require('http');
var configuration = require('../../configuration.js');
var passwordHash = require('native-password-hash');
var url = require('url');

function AdminManager() {

    var self = this;
    
    this.authenticate = function (username, password) {
        try {
            if (username == configuration.userName) {

                if (configuration.passwordHash == '' && password == '') {
                    return true;
                }

                if (passwordHash.compare(password, configuration.passwordHash)) {
                    return true;
                }   

            }

        } 
        catch (ex) {
            logger.log(constants.LOG_CATEGORY_ERROR,ex);
        }
        
        return false;
    };
    
    this.setPassword = function (oldpassword, newpassword) {

        if (configuration.passwordHash.length < 1 || passwordHash.compare(oldpassword, configuration.passwordHash)) {
            configuration.passwordHash = passwordHash.hash(newpassword);
            return true;
        }

        return false;
    };
    
    this.registerNode = function (username, passphrase, nodeName, resultCallback, errorCallback) {
        
        var self = this;
        var port = null;
        var protocol = null;

        var registerRequest = {
            passphrase: passphrase,
            username: username,
            nodeName: nodeName
        };
        
        var requestJson = JSON.stringify(registerRequest);
        
        var headers = {
            'Content-Type': 'application/json',
        };
        
        var parsedUrl = url.parse(constants.CENTRAL_URL + constants.REGISTER_PATH);
        
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
                    
                    if (resultObject.AuthKey) {
                        configuration.authKey = resultObject.AuthKey;
                        configuration.nodeId = resultObject.NodeId;

                        if (resultCallback) {
                            resultCallback(true);
                        }
  
               
                    } else {
                        if (errorCallback)
                            errorCallback('Unexpected response from registration request');
                    }
                }
                else {
                    if (errorCallback)
                        errorCallback('Username or passphrase incorrect');
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
    
    this.getStatus = function (callback) {
        var webserver = require('../webserver.js');
        webserver.getStatus(callback); 
    };
    
    this.startClient = function () {
        var webserver = require('../webserver.js');
        webserver.startClient();
    };
    
    this.__defineGetter__('needsToChangePassword', function () {
        return configuration.passwordHash == '' || passwordHash.compare('changeme', configuration.passwordHash);
    });


}

module.exports = new AdminManager();