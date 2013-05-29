module.exports = (function () {
    'use strict';

    return {
        create: function (connection) {

        }
    };
}());

var net = require('net'),
    client;

mpd = (function () {
    /*function command(stream, cmd, callback) {
        stream.write(cmd + '\n', 'UTF8', callback);
    }*/
    var stream;

    stream = (function () {
        var client,
            inprogress = false,
            ready = false,
            queue = [];

        function check() {
            if (ready && !inprogress && queue.length) {
                command(queue[0].command);
            }
        }

        function command(cmd) {
            inprogress = true;
            client.write(cmd + '\n');
        }

        return function (port, host) {
            client = net.connect({
                port: port,
                host: host
            });

            client.on('connect', function() {
                console.log('connect');
                ready = true;

                check();
            });

            client.on('data', function(data) {
                inprogress = false;

                if (queue.length) {
                    queue[0].callback(data);
                    queue.splice(0, 1);
                }

               check();
            });

            return {
                /**
                 * fifo
                 *
                 * @param command
                 * @param callback
                 */
                command: function (cmd, callback) {
                    queue.push({
                        command: cmd,
                        callback: callback
                    });

                    check();
                }
            };
        };
    }());


    function createClient(options) {
        var client,
            connection = stream(options.port, options.host);

        client = {
            status: function (callback) {
                console.log('status request');
                connection.command('status', callback);
            },

            kill: function () {
                connection.command('kill', function () {
                    console.log('conncetion killed');
                });
            }
        };

        return client;
    }

    return function (options) {
        return createClient(options);
    };
}());

exports.connect = function (options) {
    return mpd(options);
};