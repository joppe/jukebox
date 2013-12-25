/*global require, module*/

module.exports = (function () {
    'use strict';

    var response = require('./response/response.js'),
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
         * @param {Function} [success]
         * @param {Function} [error]
         */
        transmitCommand = function (command, success, error) {
            connection.command(command, function (data) {
                var parsedData = response.create(data);

                if (!parsedData.hasError() && success) {
                    success(parsedData);
                } else if (parsedData.hasError() && error) {
                    error(parsedData);
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
                transmitCommand('kill', function () {
                    callback('Successfully killed mpd service');
                }, function (response) {
                    callback(errorResponse.create(response));
                });
            },

            /**
             * @param {Function} callback
             */
            status: function (callback) {
                transmitCommand('status', function (response) {
                    callback(statusResponse.create(response));
                }, function (response) {
                    callback(errorResponse.create(response));
                });
            },

            /**
             * @param {Function} callback
             */
            stats: function (callback) {
                transmitCommand('stats', function (response) {
                    callback(statsResponse.create(response));
                }, function (response) {
                    callback(errorResponse.create(response));
                });
            },

            /**
             * @param {Function} callback
             */
            currentsong: function (callback) {
                transmitCommand('currentsong', function (response) {
                    callback(songResponse.create(response));
                }, function (response) {
                    callback(errorResponse.create(response));
                });
            },

            play: function () {
                transmitCommand('play');
            },

            stop: function () {
                transmitCommand('stop');
            },

            next: function () {
                transmitCommand('next');
            },

            previous: function () {
                transmitCommand('previous');
            },

            pause: function () {
                transmitCommand('pause 1');
            },

            resume: function () {
                transmitCommand('pause 0');
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
                transmitCommand('playid ' + id, function (response) {
                    callback(response.getProperties());
                }, function (response) {
                    callback(errorResponse.create(response));
                });
            },

            /**
             * @param {Function} callback
             */
            playlistinfo: function (callback) {
                transmitCommand('playlistinfo', function (response) {
                    callback(songsResponse.create(response));
                }, function (response) {
                    callback(errorResponse.create(response));
                });
            },

            /**
             * @param {string} uri
             * @param {Function} callback
             */
            addid: function (uri, callback) {
                transmitCommand('addid ' + prepareArgument(uri), function (response) {
                    callback(response.getProperties());
                }, function (response) {
                    callback(errorResponse.create(response));
                });
            },

            /**
             * @param {string} id
             * @param {Function} callback
             */
            deleteid: function (id, callback) {
                transmitCommand('deleteid ' + id, function (response) {
                    callback(response.getProperties());
                }, function (response) {
                    callback(errorResponse.create(response));
                });
            },

            clear: function () {
                transmitCommand('clear');
            },

            shuffle: function () {
                transmitCommand('shuffle');
            },

            /**
             * @param {string} query
             * @param {Function} callback
             */
            search: function (query, callback) {
                transmitCommand('search any ' + prepareArgument(query), function (response) {
                    callback(songsResponse.create(response));
                }, function (response) {
                    callback(errorResponse.create(response));
                });
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

                transmitCommand(command, function (response) {
                    callback(songsResponse.create(response));
                }, function (response) {
                    callback(errorResponse.create(response));
                });
            }
        };

        return client;
    }

    return {
        create: create
    };
}());