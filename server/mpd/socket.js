module.exports = (function () {
    'use strict';

    var net = require('net');

    function create() {
        var connection;

        connection = {
            connected: false,
            inprogress: false,
            client: null,
            queue: [],
            connect: function (port, host) {
                this.client = net.connect({
                    port: port,
                    host: host
                });

                this.client.on('connect', function () {
                    console.log('connect');
                    connection.connected = true;
                    connection.processQueue();
                });

                this.client.on('data', function (data) {
                    var command;

                    connection.inprogress = false;

                    if (connection.queue.length) {
                        command = connection.queue.shift();
                        command.callback(data);
                    }

                    connection.processQueue();
                });

            },
            command: function (command, callback) {
                this.queue.push({
                    command: command,
                    callback: callback
                });

                this.processQueue();
            },
            processQueue: function () {
                if (this.connected && !this.inprogress && this.queue.length) {
                    this.inprogress = true;
                    this.client.write(this.queue[0].command + '\n');
                }
            }
        };

        return connection;
    }

    return {
        create: function (port, host) {
            var connection = create();

            connection.connect(port, host);

            return {
                command: function (command, callback) {
                    connection.command(command, callback);
                }
            };
        }
    };
}());