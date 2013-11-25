/*global require, module*/

module.exports = (function () {
    'use strict';

    var net = require('net');

    /**
     * @typedef {object} SyncCommand
     * @property {string} command
     * @property {Function} callback
     */

    /**
     * Create a tcp socket connection
     *
     * @returns {{connect: Function, command: Function, processQueue: Function}}
     */
    function create() {
        var socket,
            connected = false,
            inprogress = false,
            queue = [],
            client,
            parameters = null;

        socket = {
            /**
             * @param {number} port
             * @param {string} host
             */
            connect: function (port, host) {
                parameters = {
                    port: port,
                    host: host
                };

                client = net.connect(parameters);

                client.on('connect', function () {
                    connected = true;
                    socket.processQueue();
                });

                client.on('end', function () {
                    connected = false;
                });

                client.on('data', function (data) {
                    var command,
                        callback = function () {};

                    inprogress = false;

                    if (queue.length) {
                        command = queue.shift();
                        callback = command.callback;
                    }

                    callback(data);
                    socket.processQueue();
                });
            },

            /**
             * @param {string} command
             * @param {Function} [callback]
             */
            command: function (command, callback) {
                queue.push({
                    command: command,
                    callback: callback || function () {}
                });

                socket.processQueue();
            },

            processQueue: function () {
                if (true === connected && false === inprogress && queue.length > 0) {
                    inprogress = true;
                    client.write(queue[0].command + '\n');
                } else if (connected === false) {
                    console.log('Reconnect, conncetion was dropped');
                    socket.connect(parameters.port, parameters.host);
                }
            }
        };

        return socket;
    }

    return {
        /**
         * @param {number} port
         * @param {string} host
         * @returns {{command: Function}}
         */
        connect: function (port, host) {
            var socket = create();

            socket.connect(port, host);

            return {
                /**
                 * @param {string} command
                 * @param {Function} [callback]
                 */
                command: function (command, callback) {
                    socket.command(command, callback);
                }
            };
        }
    };
}());