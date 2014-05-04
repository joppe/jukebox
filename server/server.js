/*global require, __dirname, setTimeout*/

var express = require('express'),
    http = require('http'),
    config = require('../config/jukebox.json'),
    mpdController = require('./mpd/controller.js'),
    app = express(),
    server = http.createServer(app),
    io = require('socket.io').listen(server, {log: false});

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
    'use strict';

    console.log('connection event');

    /**
     * @var {{action: {string}, attributes: {Object}, syncId: {string}}} data
     */
    socket.on('control', function (data) {
        var argument;

        switch (data.action) {
        case 'volume':
            argument = data.attributes.volume;
            break;
        case 'playid':
            argument = data.attributes.playid;
            break;
        case 'search':
            argument = data.attributes.query;
            break;
        case 'addid':
            argument = data.attributes.uri;
            break;
        }

        mpdController.proxy(data.action, argument, function (response) {
            socket.emit('update', {
                syncId: data.syncId,
                data: response,
                action: data.action
            });
        });
    });
});

(function hartbeat() {
    'use strict';

    setTimeout(function () {
        ['status', 'currentsong', 'playlistinfo'].forEach(function (action) {
            mpdController.proxy(action, undefined, function (response) {
                io.sockets.emit('broadcast', {
                    data: response,
                    action: action
                });
            });
        });

        hartbeat();
    }, 250);
}());