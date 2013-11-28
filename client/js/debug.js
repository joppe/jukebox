/*global jQuery*/

jQuery(function ($) {
    'use strict';

    var doRequest;

    doRequest = (function () {
        var $response = $('#response'),
            seperator = '\n**************************************\n';

        return function (url, req) {
            var type = 'GET';

            if (req) {
                type = 'POST';
            }

            $.ajax({
                url: url,
                data: req,
                type: type,
                success: function (res) {
                    console.log(res);
                    $response.text(res + seperator + $response.text());
                }
            });
        };
    }());

    $('ul a').on({
        click: function (event) {
            event.preventDefault();

            doRequest($(this).prop('href'));
        }
    });

    $('ul form').on({
        submit: function (event) {
            event.preventDefault();

            var $form = $(this);

            doRequest($form.prop('action'), $form.serialize());

            return false;
        }
    });
});