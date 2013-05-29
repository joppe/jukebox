'use strict';

var express = require('express'),
    socket = require('./mpd/socket.js'),
    connection = socket.connect(6600, 'localhost'),
    mpdc = require('./mpd/client.js').create(connection),
    app = express(),
    port = 3700;


mpdc.status(function (data) {
    console.log('mpdc data', data.toString());
});

app.get('/', function (req, res) {
    res.send('Hello world!');
});

app.listen(port);