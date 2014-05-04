/*global window, Player, Backbone, _, jQuery, Connection*/

(function (win, $) {
    'use strict';

    var connection;

    if (win.Player === undefined) {
        win.Player = {};
    }

    connection = new Connection('/mpd/');

    // Alternative sync
    Backbone.sync = function (method, model, options) {
        var url;

        if (typeof model.url === 'function') {
            url = model.url();
        } else {
            url = model.url;
        }

        connection.send(url, model.attributes, options.success);
    };
    /**/

    win.Player.Player = function ($container) {
        this.$container = $container;

        this.models = {
            playlistinfo: new Player.Model.Playlist(),
            currentsong: new Player.Model.Currentsong(),
            status: new Player.Model.Status(),
            search: new Player.Model.Search()
        };

        connection.on('update', _.bind(function (data) {
            var model = this.models[data.action],
                parsedData;

            if (data && data.action && model) {
                parsedData = model.parse(data.data);
                model.set(parsedData);
            }
        }, this));

        this.createViews();
        this.update();
    };
    Player.Player.prototype = {
        createViews: function () {
            new Player.View.Volume({
                el: this.$container.find('div.volume'),
                model: this.models.status,
                conncetion: connection
            });
            new Player.View.CurrentSong({
                el: this.$container.find('div.info'),
                model: this.models.currentsong,
                conncetion: connection
            });
            new Player.View.Controls({
                el: this.$container.find('div.playback'),
                model: this.models.status,
                conncetion: connection
            });
            new Player.View.Progress({
                el: this.$container.find('div.status'),
                model: this.models.status,
                conncetion: connection
            });
            new Player.View.Playlist({
                el: $('.playlist'),
                model: this.models.playlistinfo,
                currentsong: this.models.currentsong,
                conncetion: connection,
                $itemTemplate: $('#playlist-item')
            });
            new Player.View.Search({
                el: $('.search'),
                model: this.models.search,
                conncetion: connection,
                $itemTemplate: $('#search-result-item')
            });
        },

        update: function () {
            this.models.playlistinfo.fetch();
            this.models.currentsong.fetch();
            this.models.status.fetch();
        }
    };

}(window, jQuery));