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
     * @param {number} port
     * @param {string} host
     * @returns {{connect: Function, command: Function, processQueue: Function}}
     */
    function create(port, host) {
        var socket,
            connected = false,
            inprogress = false,
            queue = [],
            client,
            parameters = {
                port: port,
                host: host
            };

        socket = {
            /**
             * @param {Function} onsuccess
             * @param {Function} onerror
             */
            connect: function (onsuccess, onerror) {
                client = net.connect(parameters);

                client.on('connect', function () {
                    connected = true;
                    socket.processQueue();
                    onsuccess();
                });

                client.on('end', function () {
                    connected = false;
                });

                client.on('error', function (error) {
                    onerror(error);
                });

                client.on('data', function (data) {
                    var command,
                        callback = function () {};

                    inprogress = false;

                    if (queue.length > 0) {
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
                } else if (false === connected) {
                    console.log('Reconnect, conncetion was dropped');
                    socket.connect();
                }
            }
        };

        return socket;
    }

    return {
        /**
         * @param {number} port
         * @param {string} host
         * @param {Function} onsuccess
         * @param {Function} onerror
         * @returns {{command: Function}}
         */
        connect: function (port, host, onsuccess, onerror) {
            var socket = create(port, host, onsuccess, onerror);

            socket.connect(onsuccess, onerror);

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