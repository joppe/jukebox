/*global require, module,  __dirname */
/*jslint node: true */

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
                    var command,
                        callback = function () {};

                    socket.inprogress = false;

                    if (socket.queue.length) {
                        command = socket.queue.shift();
                        callback = command.callback;
                    }

                    callback(data);
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
        /**
         * @param {Number} port
         * @param {String} host
         * @returns {{command: Function}}
         */
        connect: function (port, host) {
            var socket = create();

            socket.connect(port, host);

            return {
                /**
                 * @param {String} command
                 * @param {Function} callback
                 */
                command: function (command, callback) {
                    socket.command(command, callback);
                }
            };
        }
    };
}());