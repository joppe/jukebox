/*global module*/

module.exports = (function () {
    'use strict';

    /**
     * @param {object} response
     * @returns {object}
     */
    function create(response) {
        var songs = [],
            song = null;

        response.getLines().forEach(function (line) {
            var property = response.getProperty(line);

            if (property.name === 'file') {
                if (song !== null) {
                    songs.push(song);
                }
                song = {};
            }

            song[property.name] = property.value;
        });

        if (song !== null) {
            songs.push(song);
        }

        return {
            songs: songs
        };
    }

    return {
        create: create
    };
}());