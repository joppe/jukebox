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

                if (ClassName === 'variant') {
                    attributes[identifier] = data;
                } else {
                    attributes[identifier] = new Model[ClassName](data, {
                        parse: true
                    });
                }
            }, this);

            return attributes;
        }
    });
    Model.Status = Model.AbstractBase.extend({});

}(window));