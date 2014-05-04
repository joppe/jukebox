/*global window, Backbone, _*/

(function (win) {
    'use strict';

    var Model;

    if (win.Player === undefined) {
        win.Player = {};
    }

    win.Player.Model = Model = {};

    /**
     * http://stackoverflow.com/questions/6535948/nested-models-in-backbone-js-how-to-approach
     */
    Model.AbstractBase = Backbone.Model.extend({
        model: {},

        /**
         * @param {Object} response
         * @returns {Object}
         */
        parse: function (response) {
            var attributes = {};

            _.each(this.model, function (ClassName, identifier) {
                var data = response[identifier],
                    model;

                if (ClassName === 'variant' || ClassName === 'string') {
                    attributes[identifier] = data;
                } else if (ClassName === 'integer') {
                    data = parseInt(data, 10);
                    attributes[identifier] = isNaN(data) ? 0 : data;
                } else {
                    model = this.get(identifier);

                    if (model) {
                        model.set(model.parse(data));
                    } else {
                        attributes[identifier] = new Model[ClassName](data, {
                            parse: true
                        });
                    }
                }
            }, this);

            return attributes;
        }
    });

    Model.Status = Model.AbstractBase.extend({
        url: 'status',

        model: {
            playlist: 'variant',
            playlistlength: 'variant',
            random: 'variant',
            repeat: 'variant',
            single: 'variant',
            song: 'variant',
            songid: 'variant',
            state: 'variant',
            volume: 'variant',
            xfade: 'variant',
            time: 'variant'
        },

        /**
         * @param {Object} [attributes]
         * @param {Object} [options]
         */
        initialize: function (attributes, options) {
            this.connection = options.connection;
        },

        /**
         * @param {Number} amount
         */
        setVolume: function (amount) {
            var volume = parseInt(this.get('volume'), 10);

            if (isNaN(volume)) {
                volume = 0;
            }

            volume += amount;
            volume = Math.max(volume, 0);
            volume = Math.min(volume, 100);

            this.connection.send('volume', {
                volume: volume
            });
        },

        /**
         * @param {string} command
         */
        setCommand: function (command) {
            this.connection.send(command);
        },

        /**
         * @param {Model.Song} song
         */
        setCurrentSong: function (song) {
            this.connection.send('playid', {
                playid: song.get('Id')
            });
        },

        /**
         * @param {Model.Song} song
         */
        addSongToPlayList: function (song) {
            this.connection.send('addid', {
                uri: song.get('file')
            });
        },

        /**
         * @returns {Number}
         */
        getTimePlayed: function () {
            var timeParts = this.get('time').split(':');

            return parseInt(timeParts[0], 10);
        },

        /**
         * @returns {Number}
         */
        getTotalTime: function () {
            var timeParts = this.get('time').split(':');

            return parseInt(timeParts[1], 10);
        }
    });

    Model.Song = Model.AbstractBase.extend({
        idAttribute: 'Id',

        model: {
            Album: 'variant',
            Artist: 'variant',
            Date: 'variant',
            Genre: 'variant',
            Id: 'variant',
            'Last-Modified': 'variant',
            Pos: 'integer',
            Time: 'integer',
            Title: 'variant',
            Track: 'variant',
            file: 'variant'
        },

        /**
         * @returns {string}
         */
        getTitle: function () {
            var title,
                fields = [
                    this.get('Title'),
                    this.get('Artist')
                ];

            title = fields.join(' - ');

            if (title === '') {
                title = this.get('file');
            }

            return title;
        }
    });

    Model.Currentsong = Model.Song.extend({
        url: 'currentsong'
    });

    Model.Playlist = Backbone.Collection.extend({
        url: 'playlistinfo',

        model: Model.Song,

        parse: function (response) {
            response = response.songs || {};

            return response;
        }
    });

    Model.Search = Model.AbstractBase.extend({
        url: 'search',

        defaults: function () {
            return {
                songs: new Model.Results()
            };
        },

        model: {
            songs: 'Results'
        },

        search: function (query) {
            query = query.replace(/^\s*|\s*$/i, '');

            if (query.length > 1) {
                this.save({
                    query: query
                });
            } else {
                this.get('songs').reset([]);
            }
        }
    });

    Model.Results = Backbone.Collection.extend({
        model: Model.Song
    });

}(window));