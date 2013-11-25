/*global module*/

/**
 * @typedef {object} Buffer
 */

module.exports = (function () {
    'use strict';

    var COMPLETION_CODE_OK = /^OK$/,
        COMPLETION_CODE_ERROR = /^ACK/;

    /**
     * @param {string} line
     * @returns {null|string}
     */
    function getProperty(line) {
        var SEPERATOR = ':',
            data = line.split(SEPERATOR),
            property = null;

        if (data.length >= 2) {
            property = {
                name: data.shift(),
                value: data.join(SEPERATOR).replace(/^\s+|\s+$/g, '')
            };
        }

        return property;
    }

    /**
     * @param {Buffer} rawData
     * @returns {{hasError: Function, getError: Function, getLines: Function, getProperty: Function, getProperties: Function, getData: Function, toJSON: Function}}
     */
    function create(rawData) {
        var lines = [],
            error = false,
            data = rawData.toString();

        if (COMPLETION_CODE_OK.test(data)) {
            lines = data.toString().replace(/\n$/, '').split('\n');

            // remove the last line (is only an OK message)
            lines.pop();
        } else if (COMPLETION_CODE_ERROR.test(data)) {
            error = data;
        } else {
            error = 'No data received';
        }

        return {
            /**
             * @returns {boolean}
             */
            hasError: function () {
                return (error !== false);
            },

            /**
             * @returns {boolean|string}
             */
            getError: function () {
                return error;
            },

            /**
             * @returns {Array}
             */
            getLines: function () {
                return lines;
            },

            getProperty: getProperty,

            /**
             *
             * @returns {object}
             */
            getProperties: function () {
                var properties = {};

                lines.forEach(function (line) {
                    var property = getProperty(line);

                    if (property !== null) {
                        properties[property.name] = property.value;
                    }
                });

                return properties;
            },

            /**
             * @returns {Buffer}
             */
            getData: function () {
                return data;
            },

            /**
             * @returns {string}
             */
            toJSON: function () {
                return JSON.stringify(this.getProperties());
            }
        };
    }

    return {
        create: create
    };
}());