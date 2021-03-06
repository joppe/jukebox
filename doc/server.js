'use strict';

var express = require('express'),
    app = express(),
    port = 3700,
    io = require('socket.io');

app.set('views', __dirname + '/tpl');
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
app.get('/', function(req, res){
    res.render('page');
});

app.get('/', function(req, res){
    res.send('It works!');
});

app.use(express.static(__dirname + '/../client'));
io.listen(app.listen(port));

io.sockets.on('connection', function (socket) {
    socket.emit('message', { message: 'welcome to the chat' });
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
});
console.log('Listening on port ' + port);