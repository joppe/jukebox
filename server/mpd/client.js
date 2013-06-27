/*global require, module,  __dirname */
/*jslint node: true */

module.exports = (function () {
    'use strict';

    function create(connection) {
        var client,
            command;

        command = (function () {
            var response = require('./response/response.js'),
                parsedData;

            return function (command, success, error) {
                connection.command(command, function (data) {
                    parsedData = response.create(data);

                    if (!parsedData.hasError() && success) {
                        success(parsedData);
                    } else if (parsedData.hasError() && error) {
                        error(parsedData);
                    }
                });
            };
        }());

        client = {
            playback: {
                play: function () {
                    command('play');
                },

                stop: function () {
                    command('stop');
                },

                next: function () {
                    command('next');
                },

                previous: function () {
                    command('previous');
                },

                pause: function () {
                    command('pause 1');
                },

                resume: function () {
                    command('pause 0');
                },

                playid: function (id, success) {
                    command('playid ' + id, function (response) {
                        success(response.toJSON());
                    });
                },

                volume: function (volume) {
                    volume = parseInt(volume, 10);
                    volume = isNaN(volume) ? 0 : volume;
                    volume = Math.max(0, Math.min(volume, 100));

                    command('setvol ' + volume);
                }
            },

            status: {
                status: function (success) {
                    command('status', function (response) {
                        success(response.toJSON());
                    });
                },

                stats: function (success) {
                    command('stats', function (response) {
                        success(response.toJSON());
                    });
                },

                currentsong: function (success) {
                    command('currentsong', function (response) {
                        success(response.toJSON());
                    });
                }
            },

            playlist: {
                playlistinfo: function (success) {
                    command('playlistinfo', function (response) {
                        success(response.toJSON());
                    });
                },

                addid: function (uri, success) {
                    command('addid ' + uri, function (response) {
                        success(response.toJSON());
                    });
                },

                deleteid: function (id, success) {
                    command('deleteid ' + id, function (response) {
                        success(response.toJSON());
                    });
                },

                clear: function (success) {
                    command('clear', function (response) {
                        success(response.toJSON());
                    });
                },

                shuffle: function (success) {
                    command('shuffle', function (response) {
                        success(response.toJSON());
                    });
                }
            },

            database: {
                search: function (query, success) {
                    command('search any ' + query, function (response) {
                        success(response.toJSON());
                    });
                },

                ls: function (query, success) {
                    command('lsinfo', function (response) {
                        success(response.toJSON());
                    });
                }
            },

            kill: function () {
                command('kill', function () {
                    console.log('conncetion killed');
                });
            }
        };

        return client;
    }

    return {
        create: create
    };
}());