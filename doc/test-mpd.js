var net = require('net'),
    client = net.connect({
            port: 6600
        }, function() { //'connect' listener
            console.log('client connected');
            client.write('status\n');
        });

client.on('data', function(data) {
    console.log(data.toString());
//    client.end();
});
client.on('end', function() {
    console.log('client disconnected');
});

/**************************************************/
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