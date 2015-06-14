var express = require('express');
var router = express.Router();
var adminManager = require('../managers/adminManager.js');
var Context = require('./context.js');

router.get('/secure/register', function (req, res, next) {
    var context = new Context(req, res, next);
    res.locals.pageTitle = 'Register Node';
    res.render('register', { title: 'Register Node', context: context });
});

router.post('/secure/register', function (req, res, next) {
    var context = new Context(req, res, next);
    if (req.session.isLoggedIn == true) {
        res.locals.pageTitle = 'Register Node';
        
        adminManager.registerNode(req.body.username, req.body.passphrase, req.body.nodename,
            function (result) {
            context.pushSuccessNotification('Node registered with Bitdog successfully!');
            adminManager.startClient();
            res.redirect('/home');
        },
            function (exception) {
            context.pushErrorNotification(exception);
            res.render('register', { title: 'Register Node', context: context });
        });     

    }
    
});

module.exports = router;