/*global require, module*/

module.exports = (function () {
    'use strict';

    var response = require('./response/response.js');

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
                }, function (message) {
                    callback(message);
                });
            },

            /*
            playback: {
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

                playid: function (id, success, error) {
                    transmitCommand('playid ' + id, function (response) {
                        success(response.toJSON());
                    }, function (response) {
                        error(response);
                    });
                },

                volume: function (volume) {
                    volume = parseInt(volume, 10);
                    volume = isNaN(volume) ? 0 : volume;
                    volume = Math.max(0, Math.min(volume, 100));

                    transmitCommand('setvol ' + volume);
                }
            },

            status: {
                status: function (success) {
                    transmitCommand('status', function (response) {
                        success(response.toJSON());
                    });
                },

                stats: function (success) {
                    transmitCommand('stats', function (response) {
                        success(response.toJSON());
                    });
                },

                currentsong: function (success) {
                    transmitCommand('currentsong', function (response) {
                        success(response.toJSON());
                    });
                }
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