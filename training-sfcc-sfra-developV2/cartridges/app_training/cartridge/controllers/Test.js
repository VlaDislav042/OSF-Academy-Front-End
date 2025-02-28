'use strict'
var server =require('server');

server.get('HelloWorld', function (req, res, next) {
    var viewData = res.getViewData();
    viewData.myvariable = 32;
    res.setViewData(viewData);
    res.render("testtemplate/mytemplate", { viewData: viewData });
    return next();
});
module.exports = server.exports();