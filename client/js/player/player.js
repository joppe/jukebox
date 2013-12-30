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
            playlist: new Player.Model.Playlist(),
            currentsong: new Player.Model.Currentsong(),
            status: new Player.Model.Status()
        };

        connection.on('update', _.bind(function (data) {
            if (data && data.action && this.models[data.action]) {
                this.models[data.action].set(data.data);
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
        },

        update: function () {
            _.each(this.models, function (model) {
                model.fetch();
            });
        }
    };

}(window, jQuery));