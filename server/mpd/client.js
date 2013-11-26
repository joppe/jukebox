/*global require, module*/

module.exports = (function () {
    'use strict';

    var response = require('./response/response.js'),
        errorResponse = require('./response/error.js'),
        statsResponse = require('./response/status.js'),
        songResponse = require('./response/song.js'),
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
            }

            /*
            playback: {

                playid: function (id, success, error) {
                    transmitCommand('playid ' + id, function (response) {
                        success(response.toJSON());
                    }, function (response) {
                        error(response);
                    });
                },
            },

            playlist: {
                playlistinfo: function (success) {
                    transmitCommand('playlistinfo', function (response) {
                        success(response.toJSON());
                    });
                },

                addid: function (uri, success) {
                    transmitCommand('addid ' + uri, function (response) {
                        success(response.toJSON());
                    });
                },

                deleteid: function (id, success) {
                    transmitCommand('deleteid ' + id, function (response) {
                        success(response.toJSON());
                    });
                },

                clear: function (success) {
                    transmitCommand('clear', function (response) {
                        success(response.toJSON());
                    });
                },

                shuffle: function (success) {
                    transmitCommand('shuffle', function (response) {
                        success(response.toJSON());
                    });
                }
            },

            database: {
                search: function (query, success) {
                    transmitCommand('search any ' + query, function (response) {
                        success(response.toJSON());
                    });
                },

                ls: function (query, success) {
                    transmitCommand('lsinfo', function (response) {
                        success(response.toJSON());
                    });
                }
            },

            /**/
        };

        return client;
    }

    return {
        create: create
    };
}());