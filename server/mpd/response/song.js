/*global module*/

module.exports = (function () {
    'use strict';

    /**
     * @param {object} response
     * @returns {object}
     */
    function create(response) {
        return response.getProperties();
    }

    return {
        create: create
    };
}());