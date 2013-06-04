/*global jQuery, MPD*/

jQuery(function ($) {
    'use strict';

    var mpd = new MPD();

    $('#playback').find('a').on({
        click: function (event) {
            event.preventDefault();

            var $anchor = $(this);

            $.ajax({
                url: $anchor.prop('href'),
                success: function (data) {
                    console.log('success', data);
                }
            });
        }
    });
});