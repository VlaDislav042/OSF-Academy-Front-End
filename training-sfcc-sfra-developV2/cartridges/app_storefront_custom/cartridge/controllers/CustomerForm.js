'use strict';

var server = require('server');

server.get('Show', function (req, res, next) {
    var URLUtils = require('dw/web/URLUtils');
    var Resource = require('dw/web/Resource');

    res.render('customerform');

    next();
});
module.exports = server.exports();
