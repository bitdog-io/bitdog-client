var express = require('express');
var router = express.Router();
var Context = require('./context.js'); 

router.get('/login', function (req, res, next) {
    var context = new Context(req, res, next);
    res.locals.pageTitle = 'Login';
    res.render('login', { title: 'Login', context: context });

});

router.post('/login', function (req, res, next) {
    var context = new Context(req, res, next);   
    res.locals.pageTitle = 'Login';
    
    context.login(req.body.username, req.body.password);
    
    if (!context.isLoggedIn) {
        context.pushErrorNotification('Username or password incorrect')
        res.render('login', { title: 'Login', context: context });
        return;
    }

    if (context.needsToChangePassword) {
        res.redirect('/secure/changePassword');  
    }
    else {  
        res.redirect('/home');
    }
});

module.exports = router;