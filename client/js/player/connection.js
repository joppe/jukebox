/*global window, io, _, Backbone*/

(function (win) {
    'use strict';

    var Connection;

    /*/ XHR version
     Commander = (function () {
         return {
             send: function (command, data, callback) {
                 $.ajax({
                 url: command,
                 type: data ? 'POST' : 'GET',
                 data: data,
                 success: callback
                 });
             }
         };
     }());
     /**/

    // Websocket version
    win.Connection = Connection = function (urlRoot) {
        this.urlRoot = urlRoot;
        this.socket = io.connect();
        this.pool = {};

        this.socket.on('update', _.bind(function (data) {
            var listener;

            if (data.syncId && this.pool[data.syncId]) {
                listener = this.pool[data.syncId];

                if (typeof listener.callback === 'function') {
                    listener.callback.call(this, data.data);
                }

                delete this.pool[data.syncId];
            }
        }, this));

        this.socket.on('broadcast', _.bind(function (data) {
            this.trigger('broadcast', data);
        }, this));
    };

    _.extend(Connection.prototype, Backbone.Events, {
        /**
         * @param {string} url
         * @param {Object} data
         * @param {Function} callback
         */
        send: function (url, data, callback) {
            var command = url.replace(this.urlRoot, ''),
                id = _.uniqueId('sync-');

            if (_.isFunction(callback)) {
                this.pool[id] = {
                    callback: callback
                };
            }

            this.socket.emit('control', {
                action: command,
                attributes: data,
                syncId: id
            });
        }
    });

}(window));