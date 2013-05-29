/*global jQuery*/

jQuery(function ($) {
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