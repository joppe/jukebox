/*global window, Backbone, Commander*/

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
            this.$percentage = this.$el.find('span.volume');

            this.model.on('change:volume', this.update, this);
        },

        update: function () {
            this.$percentage.text(this.model.get('volume') + '%');
        },

        volume: function (amount) {
            var volume = parseInt(this.model.get('volume'), 10);

            if (isNaN(volume)) {
                volume = 0;
            }

            volume += amount;
            volume = Math.max(volume, 0);
            volume = Math.min(volume, 100);

            Commander.send('volume', {
                volume: volume
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

    View.CurrentSong = Backbone.View.extend({
        initialize: function (options) {
            this.model = options.model;

            this.$artist = this.$el.find('div.artist');
            this.$song = this.$el.find('div.song');

            this.model.on('change:Id', this.update, this);
        },

        update: function () {
            this.$artist.text(this.model.get('Artist') + '/' + this.model.get('Album'));
            this.$song.text(this.model.get('Title'));
        }
    });

    View.Progress = Backbone.View.extend({
        initialize: function () {
            this.$bar = this.$el.find('div.bar');
            this.$played = this.$el.find('span.played');
            this.$total = this.$el.find('span.total');

            this.model.on('change:time', this.update, this);
        },

        update: function () {
            var timeParts = this.model.get('time').split(':'),
                played = timeParts[0],
                total = timeParts[1];

            this.$bar.css({
                width: Math.round((played / total) * 100) + '%'
            });
            this.$played.text(this.toTime(played));
            this.$total.text(this.toTime(total));
        },

        toTime: function (seconds) {
            var parts = [60 * 60, 60, 1],
                time = [];

            _.each(parts, function (value) {
                var t = Math.floor(seconds / value);

                seconds -= (t * value);
                time.push(this.strPad('' + t, 2, '0'));
            }, this);

            return time.join(':');
        },

        strPad: function (str, length, char) {
            var padLength = length - str.length;

            if (padLength === 1) {
                str = char + str;
            } else if (padLength > 1) {
                str = new Array(padLength + 1).join(char) + str;
            }

            return str;
        }
    });

    View.Controls = Backbone.View.extend({
        initialize: function () {
            this.$play = this.$el.find('a.glyphicon-play');
            this.$next = this.$el.find('a.glyphicon-step-forward');
            this.$previous = this.$el.find('a.glyphicon-step-backward');

            this.model.on('change:state', this.update, this);

            this.addEventHandlers();
        },

        addEventHandlers: function () {
            var self = this;

            this.$next.on('click', function (event) {
                var $anchor = $(this);

                event.preventDefault();

                self.command($anchor.attr('href'));
            });

            this.$previous.on('click', function (event) {
                var $anchor = $(this);

                event.preventDefault();

                self.command($anchor.attr('href'));
            });

            this.$play.on('click', function (event) {
                var $anchor = $(this);

                event.preventDefault();

                if (self.model.get('state') === 'play') {
                    self.command($anchor.data('pause'));
                } else {
                    self.command($anchor.data('play'));
                }
            });
        },

        command: function (url) {
            $.ajax({
                url: url,
                type: 'GET',
                success: function (res) {
//                    console.log(res);
                }
            });
        },

        update: function () {
            if (this.model.get('state') === 'play') {
                this.$play.removeClass('glyphicon-play');
                this.$play.addClass('glyphicon-pause');
            } else {
                this.$play.addClass('glyphicon-play');
                this.$play.removeClass('glyphicon-pause');
            }
        }
    });

}(window, jQuery));