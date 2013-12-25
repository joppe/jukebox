/*global module*/

/**
 * @typedef {object} Buffer
 */

module.exports = (function () {
    'use strict';

    var COMPLETION_CODE_OK = /^OK$/m,
        COMPLETION_CODE_ERROR = /^ACK/m;

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
    function parse(rawData) {
        var data = rawData.toString().replace(/^\s+|\s+$/g, ''),
            lines = data.split('\n'),
            error = false;

        if (COMPLETION_CODE_ERROR.test(lines[lines.length - 1])) {
            error = data;
        } else if (COMPLETION_CODE_OK.test(lines[lines.length - 1])) {
            lines.pop();
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
        parse: parse
    };
}());