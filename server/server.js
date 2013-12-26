/*global require, __dirname */

var express = require('express'),
    http = require('http'),
    config = require('../config/jukebox.json'),
    mpdController = require('./mpd/controller.js'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server);

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
    'use strict';

    res.render('jukebox');
});

app.get('/debug', function (req, res) {
    'use strict';

    res.render('debug');
});

mpdController.listen(app, config.application.urlPrefix);

server.listen(config.application.port);

io.sockets.on('connection', function (socket) {
    console.log('connection event');
});