/*global window, Backbone*/

(function (win, $) {
    'use strict';

    var View;

    if (win.Player === undefined) {
        win.Player = {};
    }

    win.Player.View = View = {};

    View.Volume = Backbone.View.extend({
        events: {
            'click .glyphicon-volume-down': 'volumeDown',
            'click .glyphicon-volume-up': 'volumeUp'
        },

        initialize: function () {
            this.model.on('change', this.update, this);
            this.$percentage = this.$el.find('span.volume');
        },

        update: function () {
            this.$percentage.text(this.model.get('volume') + '%');
        },

        volume: function (amount) {
            var volume = parseInt(this.model.get('voume'), 10);

            if (isNaN(volume)) {
                volume = 0;
            }

            volume += amount;
            volume = Math.max(volume, 0);
            volume = Math.min(volume, 100);

            $.post('/mpd/volume', {
                volume: volume
            }, function () {
//                win.console.log('posted');
            });
        },

        volumeDown: function (event) {
            event.preventDefault();

            this.volume(-5);
        },

        volumeUp: function (event) {
            event.preventDefault();

            this.volume(5);
        }
    });

}(window, jQuery));