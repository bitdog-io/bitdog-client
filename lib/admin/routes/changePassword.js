var express = require('express');
var router = express.Router();
var adminManager = require('../managers/adminManager.js');
var Context = require('./context.js'); 


router.get('/secure/changepassword', function (req, res, next) {
    var context = new Context(req, res, next);
    res.locals.pageTitle = 'Change Password';
    res.render('changePassword', { title: 'Please change your password', context: context });
});

router.post('/secure/changepassword', function (req, res, next) {
    var context = new Context(req, res, next);
    if (req.session.isLoggedIn == true) {
        if (adminManager.setPassword(req.body.oldpassword, req.body.newpassword)) {
            context.pushSuccessNotification("Password saved successfully");
            res.redirect('/home');
            return; 
        }
    }
    
    res.locals.pageTitle = 'Change Password';
    context.pushErrorNotification("Password could not be changed");
    res.render('changePassword', { title: 'Please change your password', context: context });

});  

module.exports = router;