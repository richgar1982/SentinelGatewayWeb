(function () {
    'use strict';

    angular
        .module('api-common')
        .factory('ApiInterceptorService', ApiInterceptorService)
        .config(configureInterceptor);

    ApiInterceptorService.$inject = ['SENTINEL_API_HOST_CONSTANTS', 'ApiToken'];
    function ApiInterceptorService(HOST, ApiToken) {
        var interceptor = {
            request: requestInterceptor
        };
        return interceptor;

        function requestInterceptor(config) {
            if (!_.startsWith(config.url, HOST.URL + '/rest/')) {
                return config;
            }

            var apiToken = ApiToken.get();
            return angular.extend(config, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': apiToken.type + ' ' + apiToken.token
                }
            });
        }
    }

    configureInterceptor.$inject = ['$httpProvider'];
    function configureInterceptor($httpProvider) {
        $httpProvider.interceptors.push('ApiInterceptorService');
    }
})();