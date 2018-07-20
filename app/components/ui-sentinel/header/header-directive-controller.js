(function() {
    'use strict';

    angular
        .module('ui-sentinel.header')
        .controller('HeaderController', HeaderController);

    HeaderController.$inject = ['$rootScope','$scope', '$state','ApiToken','SentinelUiSession'];
    function HeaderController($rootScope, $scope, $state, ApiToken, SentinelUiSession) {
        var vm = {
            references: {
                home: 'sentry',
                logo: './img/OnAssetHeaderLogo.png'
            },
            focusName: null,
            showNavigation: showNavigation,
            showMenu: false,
            showAdminMenu: showAdminMenu,
            showAccountMenu: showAccountMenu,
            logout: logout,
            go: go,
            toggleMenu: toggleMenu,
            navigateToParent: navigateToParent,
            clearFocus: clearFocus,
            changeFocus: changeFocus
        };
        activate();
        return vm;

        function activate() {
            // $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            //
            // });
            $scope.$watch(
                function() {
                    return SentinelUiSession.focus;
                },
                function(focus) {
                    if (!focus || focus.id === SentinelUiSession.user.accountId) {
                        vm.focusName = null;
                        return;
                    }

                    vm.focusName = focus.name;
                }
            );
        }

        function showNavigation() {
            return SentinelUiSession.user && true;
        }
        
        function showAdminMenu() {
            return SentinelUiSession.user && SentinelUiSession.user.isAnAdmin && SentinelUiSession.focus.id === SentinelUiSession.user.accountId;
        }

        function showAccountMenu() {
            return (SentinelUiSession.user && !SentinelUiSession.user.isAnAdmin) || (SentinelUiSession.user && SentinelUiSession.user.isAnAdmin && SentinelUiSession.focus.id !== SentinelUiSession.user.accountId);
        }

        function go(state) {
            vm.showMenu = false;
            $state.go(state);
        }

        function logout() {
            vm.showMenu = false;
            ApiToken.clear();
            SentinelUiSession.clear();
            $state.go('login');
        }

        function toggleMenu() {
            vm.showMenu = !vm.showMenu;
        }

        function navigateToParent() {
            $state.go($state.current.data.parentState);
        }

        function clearFocus() {
            vm.focusName = null;
            SentinelUiSession.setFocus(null);
            $state.go('accounts.list');
        }

        function changeFocus() {
            $state.go('accounts.list');
        }


    }
})();