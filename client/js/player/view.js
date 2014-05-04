/*global window, Backbone, _, Util*/

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

        /**
         * @param {Event} event
         */
        volumeDown: function (event) {
            event.preventDefault();

            this.model.setVolume(-5);
        },

        /**
         * @param {Event} event
         */
        volumeUp: function (event) {
            event.preventDefault();

            this.model.setVolume(5);
        }
    });

    View.CurrentSong = Backbone.View.extend({
        initialize: function () {
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
            var played = this.model.getTimePlayed(),
                total = this.model.getTotalTime();

            this.$bar.css({
                width: Math.round((played / total) * 100) + '%'
            });
            this.$played.text(Util.toTime(played));
            this.$total.text(Util.toTime(total));
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

                self.model.setCommand($anchor.attr('href'));
            });

            this.$previous.on('click', function (event) {
                var $anchor = $(this);

                event.preventDefault();

                self.model.setCommand($anchor.attr('href'));
            });

            this.$play.on('click', function (event) {
                var $anchor = $(this);

                event.preventDefault();

                if (self.model.get('state') === 'play') {
                    self.model.setCommand($anchor.data('pause'));
                } else {
                    self.model.setCommand($anchor.data('play'));
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

    View.Playlist = Backbone.View.extend({
        /**
         * @param {Object} options
         */
        initialize: function (options) {
            this.status = options.status;
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

        /**
         * @param {Model.Song} song
         */
        add: function (song) {
            (new View.PlaylistItem({
                model: song,
                template: this.itemTemplate,
                currentsong: this.currentsong,
                status: this.status
            })).render(this.$itemContainer);
        },

        render: function () {
            this.reset();

            this.model.each(function (song) {
                this.add(song);
            }, this);
        }
    });

    View.PlaylistItem = Backbone.View.extend({
        events: {
            'click a': 'setPlayId'
        },

        /**
         * @param {Object} options
         */
        initialize: function (options) {
            this.template = options.template;
            this.currentsong = options.currentsong;
            this.status = options.status;

            this.$el = $(this.template({
                id: this.model.get('Id'),
                title: this.model.getTitle(),
                playing: (this.currentsong.get('Id') === this.model.get('Id'))
            }));

            this.currentsong.on('change:Id', _.bind(this.update, this));
        },

        setPlayId: function () {
            this.status.setCurrentSong(this.model);
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

    View.Search = Backbone.View.extend({
        events: {
            'keyup input': 'search'
        },

        /**
         * @param {Object} options
         */
        initialize: function (options) {
            this.status = options.status;
            this.$input = this.$el.find('input');
            this.$itemContainer = this.$el.find('ul.results');
            this.itemTemplate = _.template(options.$itemTemplate.html());

            this.results = this.model.get('songs');
            this.results.on('add', this.add, this);
            this.results.on('remove', this.remove, this);

            this.render();
        },

        search: function () {
            this.model.save({
                query: this.$input.val()
            });
        },

        remove: function () {
            this.render();
        },

        reset: function () {
            this.$itemContainer.empty();
        },

        /**
         * @param {Model.Song} song
         */
        add: function (song) {
            (new View.SearchResultItem({
                model: song,
                template: this.itemTemplate,
                status: this.status
            })).render(this.$itemContainer);
        },

        render: function () {
            this.reset();

            this.results.each(function (song) {
                this.add(song);
            }, this);
        }
    });

    View.SearchResultItem = Backbone.View.extend({
        events: {
            'click a': 'addToPlayList'
        },

        /**
         * @param {Object} options
         */
        initialize: function (options) {
            this.status = options.status;
            this.template = options.template;

            this.$el = $(this.template({
                id: this.model.get('Id'),
                title: this.model.getTitle()
            }));
        },

        addToPlayList: function () {
            this.status.addSongToPlayList(this.model);
        },

        /**
         * @param {jQuery} $container
         */
        render: function ($container) {
            $container.append(this.$el);
        }
    });


}(window, jQuery));