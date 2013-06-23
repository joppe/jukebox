/*global require, module,  __dirname */
/*jslint node: true */

module.exports = (function () {
    'use strict';

    var OK = /^OK$/,
        ERROR = /^ACK/;

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

    function create(data) {
        var lastLine,
            lines = [],
            error = false;

        if (data) {
//            console.log(data.toString());
            lines = data.toString().replace(/\n$/, '').split('\n');
            lastLine = lines.pop();

            if (ERROR.test(lastLine)) {
                error = lastLine;
            }
        } else {
            error = 'No data received';
        }

        return {
            hasError: function () {
                return (error !== false);
            },
            getError: function () {
                return error;
            },
            getLines: function () {
                return lines;
            },
            getProperty: getProperty,
            getProperties: function () {
                var properties = {};

                lines.forEach(function (line, index) {
                    var property = getProperty(line);

                    if (property !== null) {
                        properties[property.name] = property.value;
                    }
                });

                return properties;
            },
            getData: function () {
                return data;
            },
            toJSON: function () {
                return JSON.stringify(this.getProperties());
            }
        };
    }

    return {
        create: create
    };
}());