/*global require, __dirname */

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

/*
app.post('/playback/playid', function (req, res) {
    var playid = req.body.playid;

    mpdc.playback.playid(playid, function (info) {
        res.send('success ' + info);
    }, function (info) {
        res.send('error :' + info.getData().toString());
    });
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
/**/
app.listen(port);
//console.log('Listening on port 3000');
//console.log(__dirname + '/client');