(function() {
    'use strict';

    angular.module('sentinel.gateway.web', [
        'ui.router',
        'ngResource',
        'ngSanitize',
        'LocalStorageModule',
        'api-common',
        'api-sentinel',
        'ui-common',
        'ui-sentinel.home',
        'ui-sentinel.login',
        'ui-sentinel.header',
        'ui-sentinel.session',
        'ui-sentinel.accounts',
        'ui-sentinel.logins',
        'ui-sentinel.sentry',
        'ui-sentinel.sentinel',
        'ui-sentinel.sentry-reports',
        'ui-sentinel.sightings',
        'ui-sentinel.simulators'

        // 'sentinel-ui.sentry',
        //'sentinel-ui.sightings',
        //'sentinel-ui.emulator'
        // 'sentinel-ui.exception'
    ]);
})();

