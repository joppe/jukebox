/*global jQuery*/

jQuery(function ($) {
    'use strict';

    var $response = $('#response'),
        seperator = '\n**************************************\n';

    $('ul a').on({
        click: function (event) {
            event.preventDefault();

            var $anchor = $(this);

            $.ajax({
                url: $anchor.prop('href'),
                success: function (data) {
                    $response.text(data + seperator + $response.text());
                }
            });
        }
    });
});