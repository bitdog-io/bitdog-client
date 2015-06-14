var express = require('express');
var router = express.Router();
var adminManager = require('../managers/adminManager.js');
var Context = require('./context.js'); 


router.get('/secure/manage', function (req, res, next) {
    var context = new Context(req, res, next);
    res.locals.pageTitle = 'Manage';
    res.render('manage', { title: 'Manage this node', context: context });
});

module.exports = router;   