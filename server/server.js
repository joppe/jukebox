/*global require, module,  __dirname */
/*jslint node: true */
'use strict';

var express = require('express'),
    socket = require('./tcp/socket.js'),
    connection = socket.connect(6600, 'localhost'),
    mpdc = require('./mpd/client.js').create(connection),
    app = express(),
    port = 3000;

// express configuration
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/../client'));

app.set('title', 'Jukebox');
app.set('views', __dirname + '/tpl');
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);

app.get('/', function (req, res) {
    res.render('jukebox');
});

app.get('/debug', function (req, res) {
    res.render('debug');
});

app.get('/playback/:control', function (req, res) {
    var control = req.params.control;

    if (typeof mpdc.playback[control] === 'function') {
        mpdc.playback[control]();
    }

    res.send(control);
});

app.post('/playback/playid', function (req, res) {
    var playid = req.body.playid;

    mpdc.playback.playid(playid, function (info) {
        res.send('success ' + info);
    }, function (info) {
        res.send('error :' + info.getData().toString());
    });
});

app.post('/playback/volume', function (req, res) {
    var volume = parseInt(req.body.volume, 10);

    if (isNaN(volume) === false) {
        mpdc.playback.volume(volume);
        res.send('volume set to: ' + volume);
    } else {
        res.send('volume must be an integer (' + volume + ')');
    }
});

app.get('/status/:status', function (req, res) {
    var status = req.params.status;

    if (typeof mpdc.status[status] === 'function') {
        mpdc.status[status](function (response) {
            res.send(response);
        });
    } else {
        res.send(status + ', command not supported');
    }
});

app.get('/playlist/playlistinfo', function (req, res) {
    mpdc.playlist.playlistinfo(function (info) {
        res.send(info);
    });
});

app.get('/playlist/addid/:uri', function (req, res) {
    var uri = req.params.uri;

    mpdc.playlist.addid(uri, function (info) {
        res.send(info);
    });
});

app.get('/playlist/deleteid/:id', function (req, res) {
    var id = req.params.id;

    mpdc.playlist.deleteid(id, function (info) {
        res.send(info);
    });
});

app.get('/playlist/clear', function (req, res) {
    mpdc.playlist.clear(function (info) {
        res.send(info);
    });
});

app.get('/playlist/shuffle', function (req, res) {
    mpdc.playlist.shuffle(function (info) {
        res.send(info);
    });
});

app.get('/database/search/:query', function (req, res) {
    var query = req.params.query;

    mpdc.database.search(query, function (info) {
        res.send(info);
    });
});

app.get('/database/ls/:query', function (req, res) {
    var query = req.params.query;

    mpdc.database.ls(query, function (info) {
        res.send(info);
    });
});

app.listen(port);
//console.log('Listening on port 3000');
//console.log(__dirname + '/client');