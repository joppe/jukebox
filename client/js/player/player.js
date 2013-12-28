/*global window, Player, Backbone, io, _*/

(function (win) {
    'use strict';

    if (win.Player === undefined) {
        win.Player = {};
    }

    // Sync with websocket
    Backbone.sync = (function () {
        var socket = io.connect(),
            pool = {};

        socket.on('update', function (data) {
            var listener;

            if (data.syncId && pool[data.syncId]) {
                listener = pool[data.syncId];

                if (listener.options.success) {
                    listener.options.success.call(this, data.data);
                }

                delete pool[data.syncId];
            }
        });

        return function (method, model, options) {
            var id = _.uniqueId('sync-'),
                url;

            pool[id] = {
                options: options
            };

            if (typeof model.url === 'function') {
                url = model.url();
            } else {
                url = model.url;
            }

            socket.emit('control', {
                action: url.replace('/mpd/', ''),
                attributes: model.attributes,
                syncId: id
            });
        };
    }());
    /**/

    win.Player.Player = function ($container) {
        var self = this;

        this.$container = $container;

        this.playlist = new Player.Model.Playlist();
        this.currentsong = new Player.Model.Currentsong();
        this.status = new Player.Model.Status();

        this.createViews();
        this.update();

//        window.setTimeout(function () {
//            self.update();
//        }, 3000);
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

}(window));