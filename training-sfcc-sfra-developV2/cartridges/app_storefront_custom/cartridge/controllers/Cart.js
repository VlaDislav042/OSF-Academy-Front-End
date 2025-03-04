'use strict';

var server = require('server');
var BasketMgr = require('dw/order/BasketMgr');
var Site = require('dw/system/Site');
var Transaction = require('dw/system/Transaction');
var ContentMgr = require('dw/content/ContentMgr');
var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');

// Extend the Cart-Show endpoint
server.extend(module.superModule);

server.append('Show', function (req, res, next) {
    var currentBasket = BasketMgr.getCurrentBasket();
    var cartTotalThreshold = Site.current.getCustomPreferenceValue('cartTotalThreshold') || 200;
    var showCartMessage = false;
    var cartMessage = '';

    if (currentBasket) {
        Transaction.wrap(function () {
            cartHelper.ensureAllShipmentsHaveMethods(currentBasket);
            basketCalculationHelpers.calculateTotals(currentBasket);
        });

        var cartTotal = currentBasket.totalGrossPrice.value;
        if (cartTotal >= cartTotalThreshold) {
            showCartMessage = true;
            var contentAsset = ContentMgr.getContent('cartThresholdMessage');
            if (contentAsset && contentAsset.online) {
                // Convert the content to a string if necessary
                var contentBody = contentAsset.custom.body.toString();
                cartMessage = contentBody.replace('[[cartTotalThreshold]]', cartTotalThreshold);
            }
        }
    }

    res.setViewData({
        showCartMessage: showCartMessage,
        cartMessage: cartMessage
    });

    next();
});

module.exports = server.exports();