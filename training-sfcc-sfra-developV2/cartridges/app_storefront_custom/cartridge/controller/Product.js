'use strict';

var server = require('server');
var ProductMgr = require('dw/catalog/ProductMgr');
var CatalogMgr = require('dw/catalog/CatalogMgr');
var ProductSearchModel = require('dw/catalog/ProductSearchModel');
var ProductSearch = require('*/cartridge/models/search/productSearch');

server.append('Show', function (req, res, next) {
    console.log('Starting');//to see is it working

    var viewData = res.getViewData();
    var productId = viewData.product.id;
    var product = ProductMgr.getProduct(productId);
    var suggestedProducts = [];
    var test_variable = "test";//just test

    if (product.isCategorized()) {
        var apiProductSearch = new ProductSearchModel();
        apiProductSearch.setCategoryID(product.getPrimaryCategory().ID);
        apiProductSearch.search();

        var productSearch = new ProductSearch(
            apiProductSearch,
            req.querystring,
            req.querystring.srule,
            CatalogMgr.getSortingOptions(),
            CatalogMgr.getSiteCatalog().getRoot()
        );

        for (var index = 0; index < 4 && index < productSearch.productIds.length; index++) {
            var suggestedProductId = productSearch.productIds[index].productID;
            var suggestedProduct = ProductMgr.getProduct(suggestedProductId);
            suggestedProducts.push(suggestedProduct);
        }
    }

    // Log the value of testVariable
    console.log('testVariable value: ' + testVariable);

    // Add the suggested products to the view data
    res.setViewData({
        suggestedProducts: suggestedProducts,
        test_variable: test_variable
    });

    next();
});

module.exports = server.exports();