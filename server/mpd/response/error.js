/*global module*/

module.exports = (function () {
    'use strict';

    /**
     * @param {object} response
     * @returns {object}
     */
    function create(response) {
        return {
            error: true,
            message: response.getData()
        };
    }

    return {
        create: create
    };
}());