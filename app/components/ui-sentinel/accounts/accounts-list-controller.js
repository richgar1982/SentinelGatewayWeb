(function() {
    'use strict';

    angular
        .module('ui-sentinel.accounts')
        .controller('AccountsListController', AccountsListController);

    /////////////

    AccountsListController.$inject = ['$rootScope', '$state', 'AccountApiService', 'SentinelUiSession'];
    function AccountsListController($rootScope, $state, AccountApiService, SentinelUiSession) {
        var vm = {
            list: null,
            account: null,
            newName: null,
            page: 1,
            countOfItems: 0,
            countOfPages: 1,
            itemsPerPage: 500,
            activateInProgress: false,
            setFocus: setFocus,
            activateBegin: activateBegin,
            activateCancel: activateCancel,
            activateSubmit: activateSubmit,
            addAccountInProgress: false,
            addAccountBegin: addAccountBegin,
            addAccountCancel: addAccountCancel,
            addAccountSubmit: addAccountSubmit,
            suspendInProgress: false,
            suspendBegin: suspendBegin,
            suspendCancel: suspendCancel,
            suspendSubmit: suspendSubmit,
            changeNameInProgress: false,
            changeNameBegin: changeNameBegin,
            changeNameCancel: changeNameCancel,
            changeNameSubmit: changeNameSubmit        
        };
        activate();
        return vm;

        function activate() {
            load();
        }

        function load() {
            vm.list = null;
            var promise = AccountApiService.listAccounts().$promise;
            promise.then(
                function(result) {
                    vm.list = result;
                    suspendCancel();
                    changeNameCancel();
                    activateCancel();
                    addAccountCancel();
                },
                function (error) {
                    console.log(error);
                }
            );
        }

        function activateBegin(account) {
            vm.activateInProgress = true;
            vm.account = account;
        }

        function activateCancel() {
            vm.activateInProgress = false;
            vm.account = null;
        }

        function activateSubmit() {
            var promise = AccountApiService.activateAccount(vm.account).$promise;
            promise.then(
                function (result) {
                    load();

                },
                function (error) {
                    load();
                    console.log(error);
                }
            );
        }

        function addAccountBegin() {
            vm.addAccountInProgress = true;
            vm.account = null;
            vm.newName = null;
        }

        function addAccountCancel() {
            vm.addAccountInProgress = false;
            vm.account = null;
        }

        function addAccountSubmit() {
            var promise = AccountApiService.addAccount(vm.newName).$promise;
            promise.then(
                function (result) {
                    load();

                },
                function (error) {
                    load();
                    console.log(error);
                }
            );
        }

        function suspendBegin(account) {
            vm.suspendInProgress = true;
            vm.account = account;
        }

        function suspendCancel() {
            vm.suspendInProgress = false;
            vm.account = null;
        }

        function suspendSubmit() {
            var promise = AccountApiService.suspendAccount(vm.account).$promise;
            promise.then(
                function (result) {
                    load();

                },
                function (error) {
                    load();
                    console.log(error);
                }
            );
        }


        function changeNameBegin(account) {
            vm.changeNameInProgress = true;
            vm.account = account;
            vm.newName = null;
            document.getElementById('txt-NewName').focus();
        }

        function changeNameCancel() {
            vm.changeNameInProgress = false;
            vm.account = null;
            vm.newName = null;
        }

        function changeNameSubmit() {
            if (!vm.newName) {
                return;
            }

            var promise = AccountApiService.changeNameForAccount(vm.account, vm.newName).$promise;
            promise.then(
                function (result) {
                    load();

                },
                function (error) {
                    load();
                    console.log(error);
                }
            );
        }

        function setFocus(account) {
            SentinelUiSession.setFocus(account);
            $state.go('home');
        }
    }



})();