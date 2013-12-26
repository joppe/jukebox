/*global require, module*/

module.exports = (function () {
    'use strict';

    var config = require('../../config/mpd.json'),
        socket = require('../tcp/socket.js');

    return {
        listen: function (expressApp, urlPrefix) {
            var connection,
                mpdc;

            connection = socket.connect(config.mpd.port, config.mpd.host, function () {
                console.log('connection error, maybe MPD is not running...');
            });

            mpdc = require('./client.js').create(connection);

            expressApp.get('/' + urlPrefix + '/kill', function (req, res) {
                mpdc.kill(function (message) {
                    res.send(message);
                });
            });
            expressApp.get('/' + urlPrefix + '/status', function (req, res) {
                mpdc.status(function (response) {
                    res.send(response);
                });
            });
            expressApp.get('/' + urlPrefix + '/stats', function (req, res) {
                mpdc.stats(function (response) {
                    res.send(response);
                });
            });
            expressApp.get('/' + urlPrefix + '/currentsong', function (req, res) {
                mpdc.currentsong(function (response) {
                    res.send(response);
                });
            });
            expressApp.get('/' + urlPrefix + '/play', function (req, res) {
                mpdc.play(function (response) {
                    res.send(response);
                });
            });
            expressApp.get('/' + urlPrefix + '/stop', function (req, res) {
                mpdc.stop(function (response) {
                    res.send(response);
                });
            });
            expressApp.get('/' + urlPrefix + '/next', function (req, res) {
                mpdc.next(function (response) {
                    res.send(response);
                });
            });
            expressApp.get('/' + urlPrefix + '/previous', function (req, res) {
                mpdc.previous(function (response) {
                    res.send(response);
                });
            });
            expressApp.get('/' + urlPrefix + '/pause', function (req, res) {
                mpdc.pause(function (response) {
                    res.send(response);
                });
            });
            expressApp.get('/' + urlPrefix + '/resume', function (req, res) {
                mpdc.resume(function (response) {
                    res.send(response);
                });
            });
            expressApp.post('/' + urlPrefix + '/volume', function (req, res) {
                var volume = parseInt(req.body.volume, 10);

                if (false === isNaN(volume)) {
                    mpdc.volume(volume, function (response) {
                        res.send(response);
                    });
                } else {
                    res.send('volume must be an integer (' + volume + ')');
                }
            });
            expressApp.post('/' + urlPrefix + '/playid', function (req, res) {
                var playid = req.body.playid;

                mpdc.playid(playid, function (info) {
                    res.send(info);
                });
            });
            expressApp.get('/' + urlPrefix + '/playlistinfo', function (req, res) {
                mpdc.playlistinfo(function (info) {
                    res.send(info);
                });
            });
            expressApp.post('/' + urlPrefix + '/addid', function (req, res) {
                var uri = req.body.uri;

                mpdc.addid(uri, function (info) {
                    res.send(info);
                });
            });
            expressApp.post('/' + urlPrefix + '/deleteid', function (req, res) {
                var id = req.body.id;

                mpdc.deleteid(id, function (info) {
                    res.send(info);
                });
            });
            expressApp.get('/' + urlPrefix + '/clear', function (req, res) {
                mpdc.clear(function (response) {
                    res.send(response);
                });
            });
            expressApp.get('/' + urlPrefix + '/shuffle', function (req, res) {
                mpdc.shuffle(function (response) {
                    res.send(response);
                });
            });
            expressApp.post('/' + urlPrefix + '/search', function (req, res) {
                var query = req.body.query;

                mpdc.search(query, function (info) {
                    res.send(info);
                });
            });
            expressApp.post('/' + urlPrefix + '/lsinfo', function (req, res) {
                var uri = req.body.uri;

                mpdc.lsinfo(uri, function (info) {
                    res.send(info);
                });
            });
        }
    };
}());