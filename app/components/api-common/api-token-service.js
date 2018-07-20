(function() {
    'use strict';

    angular
        .module('api-common')
        .factory('ApiToken', ApiToken);

    ApiToken.$inject = [];
    function ApiToken() {
        var authToken = null;

        var service = {
            get: get,
            getExpirationDate: getExpirationDate,
            set: set,
            clear: clear,
            isValid: isValid

        };

        return service;

        ///////////////////////////

        function get() {
            return authToken;
        }
        
        function getExpirationDate(milliseconds) {
            return new Date((new Date().getTime() + milliseconds * 1000));
        }

        function set(token, tokenType, expirationDate) {
            authToken = {
                token: token,
                type: tokenType,
                expiresAt: expirationDate
            };
        }


        function clear() {
            authToken = null;
        }

        function isValid() {
            return (authToken && new Date().getTime() <= authToken.expiresAt.getTime());
        }
    }

})();

