(function () {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('AccountApiService', AccountApiService);

    AccountApiService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function AccountApiService($resource, HOST) {

        var api = $resource(HOST.URL + '/rest/1/account', {}, {
            getAccount: {  method: 'GET', url: HOST.URL + '/rest/1/account'},
            changeName: {  method: 'POST', url: HOST.URL + '/rest/1/account/changename'},
            listAccounts: {  method: 'GET', url: HOST.URL + '/rest/1/admin/accounts', isArray: true},
            changeNameForAccount: {  method: 'POST', params: { accountId: '@accountId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/changename'},
            addAccount: {  method: 'POST', url: HOST.URL + '/rest/1/admin/accounts'},
            activateAccount: {method: 'POST', params: { accountId: '@accountId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/activate'},
            suspendAccount: {method: 'POST', params: { accountId: '@accountId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/suspend'}
        });

        var service = {
            getAccount: getAccount,
            changeName: changeName,
            listAccounts: listAccounts,
            changeNameForAccount: changeNameForAccount,
            activateAccount: activateAccount,
            suspendAccount: suspendAccount,
            addAccount: addAccount
        };
        return service;

        //////////////////////////////////////////////////////////////////////////////////////////////////////

        function getAccount() {
            return api.getAccount();
        }

        function addAccount(name) {
            return api.addAccount(null,{ name: name });
        }

        function changeName(name) {
            return api.changeName(null,{ name: name });
        }

        function listAccounts() {
            return api.listAccounts();
        }

        function changeNameForAccount(account, name) {
            return api.changeNameForAccount({accountId: account.id},{ name: name });
        }

        function activateAccount(account) {
            return api.activateAccount({accountId: account.id});
        }

        function suspendAccount(account) {
            return api.suspendAccount({accountId: account.id});
        }
    }

})();