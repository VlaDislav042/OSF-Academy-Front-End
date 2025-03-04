'use strict';

var server = require('server');
var ProductMgr = require('dw/catalog/ProductMgr');
var CatalogMgr = require('dw/catalog/CatalogMgr');
var ProductSearchModel = require('dw/catalog/ProductSearchModel');
var ProductSearch = require('*/cartridge/models/search/productSearch');
var URLUtils = require('dw/web/URLUtils');

server.extend(module.superModule);

server.append('Show', function (req, res, next) {
    var viewData = res.getViewData();
    var productId = viewData.product.id;
    var product = ProductMgr.getProduct(productId);
    var suggestedProducts = [];

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

            if (suggestedProduct) {
                // Retrieve the image URL
                var image = suggestedProduct.getImage('large'); // Specify the image view type
                var imageURL = image ? image.getURL().toString() : 'No Image Available';

                // Retrieve the max price
                var priceModel = suggestedProduct.getPriceModel();
                var maxPrice = 'Price Not Available';

                if (priceModel) {
                    var maxPriceValue = priceModel.maxPrice;
                    if (maxPriceValue) {
                        maxPrice = maxPriceValue.getValue();
                    } else {
                        console.log('No max price available for product ID: ' + suggestedProductId);
                    }
                } else {
                    console.log('No price model available for product ID: ' + suggestedProductId);
                }

                // Generate the product URL
                var productURL = URLUtils.url('Product-Show', 'pid', suggestedProduct.ID).toString();

                // Retrieve the color
                var color = (suggestedProduct.custom && suggestedProduct.custom.color !== null) ? suggestedProduct.custom.color : 'No Color Available';

                var productData = {
                    productName: suggestedProduct.name || 'No Name Available',
                    productID: suggestedProduct.ID,
                    imageURL: imageURL,
                    maxPrice: maxPrice,
                    url: productURL,
                    color: color
                };

                suggestedProducts.push(productData);
            } else {
                console.log('Product is null for ID: ' + suggestedProductId);
            }
        }
    }

    // Add the suggested products to the view data
    res.setViewData({
        suggestedProducts: suggestedProducts
    });

    next();
});

module.exports = server.exports();