window.jQuery = window.$ = require('jquery');
var processInclude = require("base/util");

$(document).ready(function () {
    processInclude(require('../../../../../app_storefront_base/cartridge/client/default/js/main'));
    processInclude(require('./components/test'));
});ç