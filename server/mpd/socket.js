module.exports = (function () {
    'use strict';

    var net = require('net');

    function create() {
        var socket;

        socket = {
            connected: false,
            inprogress: false,
            client: null,
            queue: [],

            /**
             * @param {Number} port
             * @param {String} host
             */
            connect: function (port, host) {
                this.client = net.connect({
                    port: port,
                    host: host
                });

                this.client.on('connect', function () {
                    socket.connected = true;
                    socket.processQueue();
                });

                this.client.on('data', function (data) {
                    var command;

                    socket.inprogress = false;

                    if (socket.queue.length) {
                        command = socket.queue.shift();
                        command.callback(data);
                    }

                    socket.processQueue();
                });

            },

            /**
             *
             * @param {String} command
             * @param {Function} callback
             */
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

        return socket;
    }

    return {
        connect: function (port, host) {
            var socket = create();

            socket.connect(port, host);

            return {
                command: function (command, callback) {
                    socket.command(command, callback);
                }
            };
        }
    };
}());