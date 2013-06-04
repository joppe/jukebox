module.exports = (function () {
    'use strict';

    function create(connection) {
        var client;

        client = {
            playback: {
                play: function () {
                    connection.command('play');
                },

                stop: function () {
                    connection.command('stop');
                },

                next: function () {
                    connection.command('next');
                },

                previous: function () {
                    connection.command('previous');
                },

                pause: function () {
                    connection.command('pause 1');
                },

                resume: function () {
                    connection.command('pause 0');
                }
            },

            setVolume: function (volume) {
                volume = parseInt(volume, 10);
                volume = isNaN(volume) ? 0 : volume;
                volume = Math.max(0, Math.min(volume, 100));

                connection.command('setvol ' + volume);
            },

            status: {
                status: function (callback) {
                    connection.command('status', callback);
                },

                currentsong: function (callback) {
                    connection.command('currentsong', callback);
                }
            },

            kill: function () {
                connection.command('kill', function () {
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