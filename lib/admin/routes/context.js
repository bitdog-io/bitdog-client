//var notifications = new Array();

function Context(req, res, next) {  
    var self = this;
    var _adminManager = require('../managers/adminManager.js');
    
    if (req.session && !req.session.notifications)
        req.session.notifications = new Array();
    
    this.login = function (username, password) {
        if (_adminManager.authenticate(username, password)) {
            req.session.username = req.body.username;
            req.session.isLoggedIn = true;
        }
        else {
            req.session.username = 'anonymous';
            req.session.isLoggedIn = false;
        }
    };
       
    this.logoff = function () {
        req.session.reset();
        req.session.notifications = new Array();
    };
    
    this.getStatus = function (callback) {
        return _adminManager.getStatus(callback);
    };
    
    this.popNotification = function () {
        if (req.session.notifications.length > 0)
            return req.session.notifications.pop();
        else
            return null;
    };
    
    this.pushSuccessNotification = function (text) {
        req.session.notifications.push({ type: 'success', message: text });
    };
    
    this.pushErrorNotification = function (text) {
        req.session.notifications.push({ type: 'error', message: text });
    };
    
    this.pushWarningNotification = function (text) {
        req.session.notifications.push({ type: 'warning', message: text });
    };
    
    this.pushInfoNotification = function (text) {
        req.session.notifications.push({ type: 'info', message: text });
    };

    this.__defineGetter__('needsToChangePassword', function () {
        return _adminManager.needsToChangePassword;
    });

    this.__defineGetter__('isLoggedIn', function () {
        return req.session.isLoggedIn == true;
    });
    
    this.__defineGetter__('hasNotifications', function () {
        return req.session.notifications.length > 0;
    });
   

    this.__defineGetter__('username', function () {
        if (!req.session.username)
            req.session.username = 'anonymous';

        return req.session.username;
    });
}

module.exports = Context;