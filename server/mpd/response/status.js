/*global require, module,  __dirname */
/*jslint node: true */

module.exports = (function () {
    'use strict';

    function create(response) {
        return response.getProperties();
    }

    return {
        create: create
    };
}());