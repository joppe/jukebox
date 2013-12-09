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
         * @param {string} url
         */
        setUrlRoot: function (url) {
            this.urlRoot = url;
        },

        /**
         * @param {Object} response
         * @returns {Object}
         */
        parse: function (response) {
            var attributes = {};

            _.each(this.model, function (ClassName, identifier) {
                var data = response[identifier];

                if (ClassName === 'variant' || ClassName === 'string') {
                    attributes[identifier] = data;
                } else if (ClassName === 'integer') {
                    data = parseInt(data, 10);
                    attributes[identifier] = isNaN(data) ? 0 : data;
                } else {
                    attributes[identifier] = new Model[ClassName](data, {
                        parse: true
                    });
                }
            }, this);

            return attributes;
        }
    });
    Model.Status = Model.AbstractBase.extend({
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

        url: '/mpd/status'
    });
    Model.Song = Model.AbstractBase.extend({
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
        }
    });
    Model.Currentsong = Model.Song.extend({
        url: 'mpd/currentsong'
    });
    Model.Playlist = Backbone.Collection.extend({
        url: 'mpd/playlistinfo',

        model: Model.Song,

        parse: function (response) {
            response = response.songs || {};

            return response;
        }
    });

}(window));