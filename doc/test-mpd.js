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


