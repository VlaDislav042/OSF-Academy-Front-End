'use strict';

var server = require('server');
var productHelpers = require('*/cartridge/scripts/helpers/productHelpers');

server.extend(module.superModule);

server.append('Show', function (req, res, next) {

    var discountPercentage = null;

    var product = res.getViewData().product;

    if (product && product.price && product.price.sales && product.price.list) {
        discountPercentage = productHelpers.calculatePercentageOff(product.price.list.value, product.price.sales.value);
    }
    res.setViewData({ discountPercentage: discountPercentage });
    next();
})

module.exports = server.exports();