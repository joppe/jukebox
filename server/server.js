var express = require('express'),
    mpd = require('./mpd.js'),
    client = mpd.connect({
        port: 6600,
        host: 'localhost'
    }),
    app = express(),
    port = 3700;

//client.kill();
client.status(function (data) {
    console.log('data', data.toString());
});

app.get('/', function (req, res) {
    res.send('Hello world!');
});

app.listen(port);