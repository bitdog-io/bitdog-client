var express = require('express');
var router = express.Router();
var Context = require('./context.js'); 

function homePage(req, res, next)
{
    var context = new Context(req, res, next);
    res.locals.pageTitle = 'Home';
    res.render('home', { title: 'Welcome', context: context });
}

router.get('/', homePage);
router.get('/home', homePage);

module.exports = router;
 