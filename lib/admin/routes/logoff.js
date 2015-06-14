var express = require('express');
var router = express.Router();
var Context = require('./context.js');

router.get('/secure/logoff', function (req, res, next) {
    var context = new Context(req, res, next);
    context.logoff();
    context.pushSuccessNotification('Logged off')
    res.redirect('/home');

});


module.exports = router;    