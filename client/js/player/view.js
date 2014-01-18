/*global window, Backbone, _*/

(function (win, $) {
    'use strict';

    var View;

    if (win.Player === undefined) {
        win.Player = {};
    }

    win.Player.View = View = {};

    View.AbstractBase = Backbone.View.extend({
        /**
         * @param {Object} options
         */
        initialize: function (options) {
            this.conncetion = options.conncetion;
        }
    });

    View.Volume = View.AbstractBase.extend({
        events: {
            'click .glyphicon-volume-down': 'volumeDown',
            'click .glyphicon-volume-up': 'volumeUp'
        },

        /**
         * @param {Object} options
         */
        initialize: function (options) {
            View.AbstractBase.prototype.initialize.call(this, options);

            this.$percentage = this.$el.find('span.volume');

            this.model.on('change:volume', this.update, this);
        },

        update: function () {
            this.$percentage.text(this.model.get('volume') + '%');
        },

        /**
         * @param {number} amount
         */
        volume: function (amount) {
            var volume = parseInt(this.model.get('volume'), 10);

            if (isNaN(volume)) {
                volume = 0;
            }

            volume += amount;
            volume = Math.max(volume, 0);
            volume = Math.min(volume, 100);

            this.conncetion.send('volume', {
                volume: volume
            });
        },

        /**
         * @param {Event} event
         */
        volumeDown: function (event) {
            event.preventDefault();

            this.volume(-5);
        },

        /**
         * @param {Event} event
         */
        volumeUp: function (event) {
            event.preventDefault();

            this.volume(5);
        }
    });

    View.CurrentSong = View.AbstractBase.extend({
        /**
         * @param {Object} options
         */
        initialize: function (options) {
            View.AbstractBase.prototype.initialize.call(this, options);

            this.$artist = this.$el.find('div.artist');
            this.$song = this.$el.find('div.song');

            this.model.on('change:Id', this.update, this);
        },

        update: function () {
            this.$artist.text(this.model.get('Artist') + '/' + this.model.get('Album'));
            this.$song.text(this.model.get('Title'));
        }
    });

    View.Progress = View.AbstractBase.extend({

        /**
         * @param {Object} options
         */
        initialize: function (options) {
            View.AbstractBase.prototype.initialize.call(this, options);

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

        /**
         * @param {number} seconds
         * @returns {string}
         */
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

        /**
         * @param {string} str
         * @param {number} length
         * @param {string} char
         * @returns {string}
         */
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

    View.Controls = View.AbstractBase.extend({
        /**
         * @param {Object} options
         */
        initialize: function (options) {
            View.AbstractBase.prototype.initialize.call(this, options);

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

        /**
         * @param {string} url
         */
        command: function (url) {
            this.conncetion.send(url);
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

    View.Playlist = View.AbstractBase.extend({
        /**
         * @param {Object} options
         */
        initialize: function (options) {
            View.AbstractBase.prototype.initialize.call(this, options);

            this.$itemContainer = this.$el.find('ol');
            this.currentsong = options.currentsong;
            this.itemTemplate = _.template(options.$itemTemplate.html());

            this.model.on('add', this.add, this);
            this.model.on('remove', this.remove, this);

            this.render();
        },

        remove: function () {
            this.render();
        },

        reset: function () {
            this.$itemContainer.empty();
        },

        add: function (song) {
            (new View.PlaylistItem({
                model: song,
                template: this.itemTemplate,
                currentsong: this.currentsong,
                conncetion: this.conncetion
            })).render(this.$itemContainer);
        },

        render: function () {
            this.reset();

            this.model.each(function (song) {
                this.add(song);
            }, this);
        }
    });

    View.PlaylistItem = View.AbstractBase.extend({
        events: {
            'click a': 'setPlayId'
        },

        /**
         * @param {Object} options
         */
        initialize: function (options) {
            View.AbstractBase.prototype.initialize.call(this, options);

            this.template = options.template;
            this.currentsong = options.currentsong;

            this.$el = $(this.template({
                id: this.model.get('Id'),
                title: this.getTitle(),
                playing: (this.currentsong.get('Id') === this.model.get('Id'))
            }));

            this.currentsong.on('change:Id', _.bind(this.update, this));
        },

        /**
         * @returns {string}
         */
        getTitle: function () {
            var title,
                fields = [
                    this.model.get('Title'),
                    this.model.get('Artist')
                ];

            title = fields.join(' - ');

            if (title === '') {
                title = this.model.get('file');
            }

            return title;
        },

        setPlayId: function () {
            this.conncetion.send('playid', {
                playid: this.model.get('Id')
            });
        },

        update: function () {
            if (this.currentsong.get('Id') === this.model.get('Id')) {
                this.$el.addClass('playing');
            } else {
                this.$el.removeClass('playing');
            }
        },

        /**
         * @param {jQuery} $container
         */
        render: function ($container) {
            $container.append(this.$el);
        }
    });
}(window, jQuery));