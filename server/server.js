/*global require, __dirname */

var express = require('express'),
    exec = require('child_process').exec,
    socket = require('./tcp/socket.js'),
    connection,
    mpdc,
    app = express(),
    port = 3000;

connection = socket.connect(6600, 'localhost', function () {
    'use strict';

    console.log('onerror');
    exec('mpd', function (error) {
        console.log('mpd started?');
        if (error !== null) {
            connection = socket.connect(6600, 'localhost');
        }
    });
});

mpdc = require('./mpd/client.js').create(connection);

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

app.get('/mpd/kill', function (req, res) {
    'use strict';

    mpdc.kill(function (message) {
        res.send(message);
    });
});
app.get('/mpd/status', function (req, res) {
    'use strict';

    mpdc.status(function (response) {
        res.send(response);
    });
});
app.get('/mpd/stats', function (req, res) {
    'use strict';

    mpdc.stats(function (response) {
        res.send(response);
    });
});
app.get('/mpd/currentsong', function (req, res) {
    'use strict';

    mpdc.currentsong(function (response) {
        res.send(response);
    });
});
app.get('/mpd/play', function (req, res) {
    'use strict';

    mpdc.play();
    res.send('play');
});
app.get('/mpd/stop', function (req, res) {
    'use strict';

    mpdc.stop();
    res.send('stop');
});
app.get('/mpd/next', function (req, res) {
    'use strict';

    mpdc.next();
    res.send('next');
});
app.get('/mpd/previous', function (req, res) {
    'use strict';

    mpdc.previous();
    res.send('previous');
});
app.get('/mpd/pause', function (req, res) {
    'use strict';

    mpdc.pause();
    res.send('pause');
});
app.get('/mpd/resume', function (req, res) {
    'use strict';

    mpdc.resume();
    res.send('resume');
});
app.post('/mpd/volume', function (req, res) {
    'use strict';

    var volume = parseInt(req.body.volume, 10);

    if (false === isNaN(volume)) {
        mpdc.volume(volume);
        res.send('volume set to: ' + volume);
    } else {
        res.send('volume must be an integer (' + volume + ')');
    }
});
app.post('/mpd/playid', function (req, res) {
    'use strict';

    var playid = req.body.playid;

    mpdc.playid(playid, function (info) {
        res.send(info);
    });
});
app.get('/mpd/playlistinfo', function (req, res) {
    'use strict';

    mpdc.playlistinfo(function (info) {
        res.send(info);
    });
});
app.post('/mpd/addid', function (req, res) {
    'use strict';

    var uri = req.body.uri;

    mpdc.addid(uri, function (info) {
        res.send(info);
    });
});
app.post('/mpd/deleteid', function (req, res) {
    'use strict';

    var id = req.body.id;

    mpdc.deleteid(id, function (info) {
        res.send(info);
    });
});
app.get('/mpd/clear', function (req, res) {
    'use strict';

    mpdc.clear();
    res.send('cleared');
});
app.get('/mpd/shuffle', function (req, res) {
    'use strict';

    mpdc.shuffle();
    res.send('shuffled');
});
app.post('/mpd/search', function (req, res) {
    'use strict';

    var query = req.body.query;

    mpdc.search(query, function (info) {
        res.send(info);
    });
});
app.post('/mpd/lsinfo', function (req, res) {
    'use strict';

    var uri = req.body.uri;

    mpdc.lsinfo(uri, function (info) {
        res.send(info);
    });
});

app.listen(port);
//console.log('Listening on port 3000');
//console.log(__dirname + '/client');

 /**/