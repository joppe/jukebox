/*global window, Player*/

(function (win) {
    'use strict';

    if (win.Player === undefined) {
        win.Player = {};
    }

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
        },

        update: function () {
            this.status.fetch();
        }
    };

}(window));