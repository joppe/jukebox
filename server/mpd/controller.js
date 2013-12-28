/*global require, module*/

module.exports = (function () {
    'use strict';

    var config = require('../../config/mpd.json'),
        socket = require('../tcp/socket.js'),
        getClient;

    getClient = (function () {
        var client = null;

        /**
         * @param {Function} callback
         */
        function createClient(callback) {
            var mpdc,
                connection;

            connection = socket.connect(config.mpd.port, config.mpd.host, function () {
                mpdc = require('./client.js').create(connection);

                callback(mpdc);
            },function () {
                callback(false);
            });
        }

        return function (callback) {
            if (null === client) {
                createClient(function (mpdc) {
                    client = mpdc;
                    callback(mpdc);
                });
            } else {
                callback(client);
            }
        };
    }());

    return {
        /**
         * @param {string} control
         * @param {*} argument
         * @param {Function} callback
         */
        proxy: function (control, argument, callback) {
            getClient(function (client) {
                var args = [];

                if (null === client) {
                    callback('MPD is not running');
                } else if (client[control] === undefined) {
                    callback('Control "' + control + '" unavailable');
                } else {
                    if (argument) {
                        args.push(argument);
                    }
                    args.push(callback);

                    client[control].apply(client, args);
                }
            });
        },

        /**
         * @param {Function} expressApp
         * @param {string} urlPrefix
         */
        listen: function (expressApp, urlPrefix) {
            var proxy = this.proxy;

            ['kill', 'status', 'stats', 'currentsong', 'play', 'stop', 'next', 'previous', 'pause', 'resume', 'playlistinfo', 'clear', 'shuffle'].forEach(function (control) {
                expressApp.get('/' + urlPrefix + '/' + control, function (req, res) {
                    proxy(control, undefined, function (data) {
                        res.send(data);
                    });
                });
            });

            expressApp.post('/' + urlPrefix + '/', function (req, res) {
                var volume = parseInt(req.body.volume, 10);

                if (false === isNaN(volume)) {
                    proxy('volume', volume, function (data) {
                        res.send(data);
                    });
                } else {
                    res.send('volume must be an integer (' + volume + ')');
                }
            });

            expressApp.post('/' + urlPrefix + '/playid', function (req, res) {
                var playid = req.body.playid;

                proxy('playid', playid, function (data) {
                    res.send(data);
                });
            });

            expressApp.post('/' + urlPrefix + '/addid', function (req, res) {
                var addid = req.body.uri;

                proxy('addid', addid, function (data) {
                    res.send(data);
                });
            });

            expressApp.post('/' + urlPrefix + '/deleteid', function (req, res) {
                var deleteid = req.body.id;

                proxy('deleteid', deleteid, function (data) {
                    res.send(data);
                });
            });

            expressApp.post('/' + urlPrefix + '/search', function (req, res) {
                var query = req.body.query;

                proxy('search', query, function (data) {
                    res.send(data);
                });
            });
            expressApp.post('/' + urlPrefix + '/lsinfo', function (req, res) {
                var uri = req.body.uri;

                proxy('lsinfo', uri, function (data) {
                    res.send(data);
                });
            });
        }
    };
}());