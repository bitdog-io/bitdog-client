var express = require('express');
var router = express.Router();
var adminManager = require('../managers/adminManager.js');
var Context = require('./context.js');


router.all(function (req, res, next) {
    var context = new Context(req, res, next);
    res.locals.pageTitle = 'Not Found';
});

      
module.exports = router;   