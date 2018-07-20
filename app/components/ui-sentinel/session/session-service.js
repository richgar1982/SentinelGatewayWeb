(function() {
    'use strict';

    angular
        .module('ui-sentinel.session')
        .factory('SentinelUiSession', SentinelUiSession);

    SentinelUiSession.$inject = ['ApiToken', 'LoginsApiService', 'AccountApiService', 'localStorageService'];
    function SentinelUiSession(ApiToken, LoginsApiService, AccountApiService, localStorageService) {
        var service = {
            user: null,
            focus: null,
            mode: 'account',
            toggleAdminMode: toggleAdminMode,
            create: create,
            setFocus: setFocus,
            set: set,
            clear: clear,
            isValid: isValid,
            store: store,
            load: load,
            isReloaded: false
        };

        return service;

        ///////////////////////////
        
        function create(tokenResponse, onSuccessFn, onErrorFn) {
            clear();

            ApiToken.set(tokenResponse.access_token, tokenResponse.token_type, ApiToken.getExpirationDate(tokenResponse.expires_in));
            if (!ApiToken.isValid()) {
                return;
            }
            
            var currentLoginPromise = LoginsApiService.getCurrent().$promise;
            currentLoginPromise.then(
                function(login) {
                    var currentAccountPromise = AccountApiService.getAccount().$promise;
                    currentAccountPromise.then(
                        function(account) {
                            service.user = {
                                id: login.id,
                                name: login.userName,
                                role: login.userRole,
                                isAnAdmin: login.role === 'api-admin',
                                accountId: account.id,
                                accountName: account.name
                            };
                            service.focus = {
                                id: account.id,
                                name: account.name
                            };

                            store();
                            if (onSuccessFn) {
                                onSuccessFn();
                            }
                        },
                        function(error) {
                            console.log(error);
                            if (onErrorFn) {
                                onErrorFn();
                            }
                        }
                    );
                },
                function (error) {
                    console.log(error);
                    if (onErrorFn) {
                        onErrorFn();
                    }
                });
        }

        function set(user, focus) {
            service.user = user;
            if (user) {
                service.user.isAnAdmin = user && user.role === 'api-admin';
            }
            service.focus = focus;
            localStorageService.set('user', service.user);
            localStorageService.set('focus', service.focus);
        }

        function setFocus(account) {
            service.focus = {
                id: !account ? service.user.accountId : account.id,
                name: !account ? service.user.accountName : account.name
            };
            localStorageService.set('focus', service.focus);
        }
        
        function store() {
            var authToken = ApiToken.get();
            localStorageService.set('token', authToken.token);
            localStorageService.set('tokenType', authToken.type);
            localStorageService.set('tokenExpirationTime', authToken.expiresAt);
            localStorageService.set('user', service.user);
            localStorageService.set('focus', service.focus);
        }

        function load() {
            ApiToken.set(
                localStorageService.get('token'),
                localStorageService.get('tokenType'),
                new Date(localStorageService.get('tokenExpirationTime')));

            service.user = localStorageService.get('user');
            service.focus = localStorageService.get('focus');
            service.isReloaded = true;
        }

        function clear() {
            ApiToken.clear();
            service.user = null;
            service.focus = null;
            service.isReloaded = false;
            localStorageService.set('token', null);
            localStorageService.set('tokenType', null);
            localStorageService.set('tokenExpirationTime', null);
            localStorageService.set('user', null);
            localStorageService.set('focus', null);
        }
        
        function isValid() {
            if (!service.user || !service.focus) {
                load();
            }

            return ApiToken.isValid() && service.user && service.focus;
        }

        function toggleAdminMode() {
            service.mode = service.mode === 'admin' ? 'account' : 'admin';
        }
    }

})();

