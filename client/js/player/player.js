/*global window, Player, Backbone, io, _, jQuery, Commander*/

(function (win, $) {
    'use strict';

    if (win.Player === undefined) {
        win.Player = {};
    }

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
    win.Commander = (function () {
        var socket = io.connect(),
            pool = {};

        socket.on('update', function (data) {
            var listener;

            if (data.syncId && pool[data.syncId]) {
                listener = pool[data.syncId];

                if (typeof listener.callback === 'function') {
                    listener.callback.call(this, data.data);
                }

                delete pool[data.syncId];
            }
        });

        return {
            /**
             * @param {string} command
             * @param {Object} data
             * @param {Function} callback
             */
            send: function (command, data, callback) {
                var id = _.uniqueId('sync-');

                pool[id] = {
                    callback: callback
                };

                socket.emit('control', {
                    action: command,
                    attributes: data,
                    syncId: id
                });
            }
        };
    }());
    /**/

    // Alternative sync
    Backbone.sync = function (method, model, options) {
        var url;

        if (typeof model.url === 'function') {
            url = model.url();
        } else {
            url = model.url;
        }

        Commander.send(url.replace('/mpd/', ''), model.attributes, options.success);
    };
    /**/

    win.Player.Player = function ($container) {
        this.$container = $container;

        this.playlist = new Player.Model.Playlist();
        this.currentsong = new Player.Model.Currentsong();
        this.status = new Player.Model.Status();

        this.createViews();
        this.update();
    };
    Player.Player.prototype = {
        createViews: function () {
            new Player.View.Volume({
                el: this.$container.find('div.volume'),
                model: this.status
            });
            new Player.View.CurrentSong({
                el: this.$container.find('div.info'),
                model: this.currentsong
            });
            new Player.View.Controls({
                el: this.$container.find('div.playback'),
                model: this.status
            });
            new Player.View.Progress({
                el: this.$container.find('div.status'),
                model: this.status
            });
        },

        update: function () {
            this.status.fetch();
            this.currentsong.fetch();
        }
    };

}(window, jQuery));