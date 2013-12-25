/*global require, module*/

module.exports = (function () {
    'use strict';

    var parser = require('./response/parser.js'),
        errorResponse = require('./response/error.js'),
        statsResponse = require('./response/status.js'),
        songResponse = require('./response/song.js'),
        songsResponse = require('./response/songs.js'),
        statusResponse = require('./response/status.js');

    function create(connection) {
        var client,
            transmitCommand,
            prepareArgument;

        /**
         * @param {string} command
         * @param {Function} [callback]
         * @param {Object} [responseType]
         */
        transmitCommand = function (command, callback, responseType) {
            connection.command(command, function (data) {
                var parsedData,
                    response;

                if (callback !== undefined) {
                    parsedData = parser.parse(data);

                    if (parsedData.hasError()) {
                        response = errorResponse.create(parsedData);
                    } else if (responseType === undefined) {
                        response = responseType.create(parsedData);
                    } else {
                        response = parsedData.getProperties();
                    }

                    callback(response);
                }
            });
        };

        /**
         * @param {string} arg
         * @returns {string}
         */
        prepareArgument = function (arg) {
            return '"' + arg.replace('"', '\\"') + '"';
        };

        client = {
            /**
             * Stop MPD from running
             *
             * @param {Function} [callback]
             */
            kill: function (callback) {
                transmitCommand('kill', callback);
            },

            /**
             * @param {Function} callback
             */
            status: function (callback) {
                transmitCommand('status', callback, statusResponse);
            },

            /**
             * @param {Function} callback
             */
            stats: function (callback) {
                transmitCommand('stats', callback, statsResponse);
            },

            /**
             * @param {Function} callback
             */
            currentsong: function (callback) {
                transmitCommand('currentsong', callback, songResponse);
            },

            /**
             * @param {Function} callback
             */
            play: function (callback) {
                transmitCommand('play', callback);
            },

            /**
             * @param {Function} callback
             */
            stop: function (callback) {
                transmitCommand('stop', callback);
            },

            /**
             * @param {Function} callback
             */
            next: function (callback) {
                transmitCommand('next', callback);
            },

            /**
             * @param {Function} callback
             */
            previous: function (callback) {
                transmitCommand('previous', callback);
            },

            /**
             * @param {Function} callback
             */
            pause: function (callback) {
                transmitCommand('pause 1', callback);
            },

            /**
             * @param {Function} callback
             */
            resume: function (callback) {
                transmitCommand('pause 0', callback);
            },

            /**
             * @param {number} volume
             */
            volume: function (volume) {
                transmitCommand('setvol ' + volume);
            },

            /**
             * @param {string} id
             * @param {Function} callback
             */
            playid: function (id, callback) {
                transmitCommand('playid ' + id, callback);
            },

            /**
             * @param {Function} callback
             */
            playlistinfo: function (callback) {
                transmitCommand('playlistinfo', callback, songsResponse);
            },

            /**
             * @param {string} uri
             * @param {Function} callback
             */
            addid: function (uri, callback) {
                transmitCommand('addid ' + prepareArgument(uri), callback);
            },

            /**
             * @param {string} id
             * @param {Function} callback
             */
            deleteid: function (id, callback) {
                transmitCommand('deleteid ' + id, callback);
            },

            /**
             * @param {Function} callback
             */
            clear: function (callback) {
                transmitCommand('clear', callback);
            },

            /**
             * @param {Function} callback
             */
            shuffle: function (callback) {
                transmitCommand('shuffle', callback);
            },

            /**
             * @param {string} query
             * @param {Function} callback
             */
            search: function (query, callback) {
                transmitCommand('search any ' + prepareArgument(query), callback, songsResponse);
            },

            /**
             * @param {string} uri
             * @param {Function} callback
             */
            lsinfo: function (uri, callback) {
                var command = 'lsinfo';

                if (uri) {
                    command += ' ' + prepareArgument(uri);
                }

                transmitCommand(command, callback, songsResponse);
            }
        };

        return client;
    }

    return {
        create: create
    };
}());