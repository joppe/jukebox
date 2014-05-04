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
         * @param {Object} [attributes]
         * @param {Object} [options]
         */
        initialize: function (attributes, options) {
            if (options) {
                this.options = options;

                if (options.urlRoot) {
                    this.urlRoot = options.urlRoot;
                }
            }
        },

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

    Model.Search = Model.Playlist.extend({
        url: 'search'
    });

}(window));