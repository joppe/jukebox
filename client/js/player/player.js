/*global window, Player*/

(function (win) {
    'use strict';

    if (win.Player === undefined) {
        win.Player = {};
    }

    win.Player.Player = function ($container) {
        var self = this;

        this.$container = $container;

        this.playlist = new Player.Model.Playlist();
        this.currentsong = new Player.Model.Currentsong();
        this.status = new Player.Model.Status();

        this.createViews();
        this.update();

        window.setTimeout(function () {
            self.update();
        }, 3000);
    };
    Player.Player.prototype = {
        createViews: function () {
            new Player.View.Volume({
                el: this.$container.find('div.volume'),
                model: this.status
            });
        },

        update: function () {
            this.status.fetch();
        }
    };

}(window));