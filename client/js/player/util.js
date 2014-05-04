/*glolbal*/

(function (win) {
    'use strict';

    win.Util = {
        /**
         * @param {string} str
         * @param {Number} length
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
        },

        /**
         * @param {Number} seconds
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
        }
    };
}(window));