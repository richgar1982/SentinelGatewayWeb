(function() {
    'use strict';

    angular
        .module('ui-sentinel.logins')
        .controller('LoginsListController', LoginsListController);

    /////////////

    LoginsListController.$inject = ['$rootScope', '$state', 'LoginsApiService', 'AccountApiService'];
    function LoginsListController($rootScope, $state, LoginsApiService, AccountApiService) {
        var vm = {
            list: null,
            page: 1,
            countOfItems: 0,
            countOfPages: 1,
            itemsPerPage: 500,
            addLoginInProgress: false,
            addLoginAccounts: null,
            addLoginBegin: addLoginBegin,
            addLoginCancel: addLoginCancel,
            addLoginSubmit: addLoginSubmit,
            changeNameInProgress: false,
            changeNameBegin: changeNameBegin,
            changeNameCancel: changeNameCancel,
            changeNameSubmit: changeNameSubmit,            
            deleteInProgress: false,
            deleteBegin: deleteBegin,
            deleteCancel: deleteCancel,
            deleteSubmit: deleteSubmit,
            login: null,
            passwordInProgress: false,
            passwordBegin: passwordBegin,
            passwordCancel: passwordCancel,
            passwordSubmit: passwordSubmit,
            password: null
        };
        activate();
        return vm;

        function activate() {
            load();
        }

        function load() {
            vm.list = null;
            var promise = LoginsApiService.listLogins().$promise;
            promise.then(
                function(result) {
                    vm.list = result;
                    deleteCancel();
                    addLoginCancel();
                    changeNameCancel();
                    passwordCancel();
                },
                function (error) {
                    console.log(error);
                }
            );
        }

        function addLoginBegin() {
            vm.addLoginAccounts = null;
            vm.login = null;            
            var promise = AccountApiService.listAccounts().$promise;
            promise.then(
                function(result) {
                    vm.addLoginAccounts = result;
                    vm.addLoginInProgress = true;
                    vm.login = {
                        account: null,
                        userName: null,
                        password: null
                    };
                },
                function (error) {
                    console.log(error);
                }
            );

        }

        function addLoginCancel() {
            vm.addLoginInProgress = false;
            vm.addLoginAccounts = null;
            vm.login = null;
        }

        function addLoginSubmit() {
            var promise = LoginsApiService.addLogin(vm.login.account,  vm.login.userName, vm.login.password).$promise;
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

        function changeNameBegin(login) {
            vm.changeNameInProgress = true;
            vm.login = login;
            vm.newName = null;
            document.getElementById('txt-NewName').focus();
        }

        function changeNameCancel() {
            vm.changeNameInProgress = false;
            vm.login = null;
            vm.newName = null;
        }

        function changeNameSubmit() {
            if (!vm.newName) {
                return;
            }

            var promise = LoginsApiService.changeNameForLogin(vm.login, vm.newName).$promise;
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

        function deleteBegin(login) {
            vm.deleteInProgress = true;
            vm.login = login;
        }

        function deleteCancel() {
            vm.deleteInProgress = false;
            vm.login = null;
        }

        function deleteSubmit() {
            var promise = LoginsApiService.deleteLogin(vm.login).$promise;
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

        function passwordBegin(login) {
            vm.passwordInProgress = true;
            vm.login = login;
        }

        function passwordCancel() {
            vm.passwordInProgress = false;
            vm.login = null;
        }

        function passwordSubmit() {
            if (!vm.password) {
                return;
            }

            var promise = LoginsApiService.setPasswordForLogin(vm.login, vm.password).$promise;
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
    }



})();