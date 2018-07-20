(function () {
    'use strict';

    angular
        .module('ui-sentinel.logins')
        .config(routes);

    routes.$inject = ['$stateProvider'];
    function routes($stateProvider) {
        $stateProvider
            .state('logins', {
                abstract: true,
                url: '/logins',
                template: '<ui-view/>',
                data: {
                    authorizationRequired: true,
                    pageTitle: 'Logins',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('logins.list', {
                url: '/list',
                templateUrl: 'ui-sentinel-logins/logins-list.html'
            })
        ;
    }

})();