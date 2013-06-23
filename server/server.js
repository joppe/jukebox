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

app.get('/playback/:control', function (req, res) {
    var control = req.params.control;

    if (typeof mpdc.playback[control] === 'function') {
        mpdc.playback[control]();
    }

    res.send(control);
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

app.listen(port);
//console.log('Listening on port 3000');
//console.log(__dirname + '/client');