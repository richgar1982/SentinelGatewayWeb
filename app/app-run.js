(function() {
    'use strict';

    angular
        .module('sentinel.gateway.web')
        .run(runBlock);

    ////////////////////////
    runBlock.$inject = ['$rootScope', '$state', '$stateParams', 'SentinelUiSession', 'localStorageService'];
    function runBlock($rootScope, $state, $stateParams, SentinelUiSession, localStorageService) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        var locale = window.navigator.userLanguage || window.navigator.language;
        moment.locale(locale);

        $rootScope.$on('$stateChangeStart', onStateChangeStart);
        $rootScope.$on('$stateChangeSuccess', onStateChangeSuccess);

        function onStateChangeStart (event, toState, toParams, fromState, fromParams) {
            if (toState.name === 'login') {
                return;
            }

            if (toState.data.authorizationRequired && !SentinelUiSession.isValid()) {
                event.preventDefault();
                SentinelUiSession.clear();
                $state.go('login');
                return;
            }

            var reloadState = localStorageService.get('reloadState');
            var reloadParams = localStorageService.get('reloadParams');

            if (SentinelUiSession.isReloaded && reloadState) {
                event.preventDefault();
                SentinelUiSession.isReloaded = false;
                $state.go(reloadState, reloadParams);
            }
            SentinelUiSession.isReloaded = false;

            //next, make sure user has proper roles
            var authorizedRoles = toState.data.authorizedRoles;
            //if (!AuthService.isAuthorized(authorizedRoles)) {
            //    event.preventDefault();
            //    if (AuthService.isAuthenticated()) {
            //        // user is not allowed
            //        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
            //    } else {
            //        // user is not logged in
            //        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            //    }
            //}
        }

        function onStateChangeSuccess (event, toState, toParams, fromState, fromParams) {
            if (toState.data.authorizationRequired) {
                localStorageService.set('reloadState', toState.name);
                localStorageService.set('reloadParams', toParams);
            }

            // if (ApiToken.isValid()) {
            //     ApiToken.store();
            // }
            // else {
            //     console.log('clearing session');
            //     localStorageService.clearAll();
            // }
        }
    }

})();