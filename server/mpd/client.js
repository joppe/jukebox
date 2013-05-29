module.exports = (function () {
    'use strict';

    function create(connection) {
        var client;

        client = {
            status: function (callback) {
                connection.command('status', callback);
            },

            kill: function () {
                connection.command('kill', function () {
                    console.log('conncetion killed');
                });
            }
        };

        return client;
    }

    return {
        create: create
    };
}());