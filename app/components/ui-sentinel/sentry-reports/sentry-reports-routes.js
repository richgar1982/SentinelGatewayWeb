(function () {
    'use strict';

    angular
        .module('ui-sentinel.sentry-reports')
        .config(routes);

    routes.$inject = ['$stateProvider'];
    function routes($stateProvider) {
        $stateProvider
            .state('sentry-reports', {
                abstract: true,
                url: '/sentry-reports',
                template: '<ui-view/>',
                data: {
                    authorizationRequired: true,
                    pageTitle: 'Sentry Reports',
                    subTitle: null,
                    parentState: null
                }
            })
            .state('sentry-reports.latest', {
                url: '/latest',
                templateUrl: 'ui-sentinel-sentry-reports/latest-sentry-reports-list.html'
            })
            .state('sentry-reports.by-device', {
                url: '/{imei}',
                templateUrl: 'ui-sentinel-sentry-reports/sentry-reports-by-device.html',
                params: {
                    report: null,
                    view: null,
                    to: null,
                    from: null
                },
                data: {
                    subTitle: 'By Device'
                }
            })
        ;
    }

})();