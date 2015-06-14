var express = require('express');
var router = express.Router();
var Context = require('./context.js');

router.get('/api/status', function (req, res, next) {
    // Disable caching for content files
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    
    var context = new Context(req, res, next);
    res.setHeader('Content-Type', 'application/json');
    
    context.getStatus(function (status) {
        res.end(JSON.stringify(status));
    });
     
    
    return false;
});
    
 

module.exports = router;