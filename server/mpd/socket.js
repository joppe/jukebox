module.exports = (function () {
    'use strict';

    var net = require('net');

    function processData(data, callback, errorHandler) {
        var lines = data.toString().split('\n');

        console.log(lines);
        callback(data);
    }

    function create() {
        var socket,
            errorHandler = function (message) {
                console.log(message);
            };

        socket = {
            connected: false,
            inprogress: false,
            client: null,
            queue: [],

            addErrorHandler: function (callback) {
                var oldHandler = errorHandler;

                errorHandler = function () {
                    callback();
                    oldHandler();
                };
            },

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
                    var command,
                        callback = function () {};

                    socket.inprogress = false;

                    if (socket.queue.length) {
                        command = socket.queue.shift();
                        callback = command.callback;
                    }

                    processData(data, callback, errorHandler);
                    socket.processQueue();
                });

            },

            /**
             * @param {String} command
             * @param {Function} [callback]
             */
            command: function (command, callback) {
                callback = callback !== undefined ? callback : function () {};

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