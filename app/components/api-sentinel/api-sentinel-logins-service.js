(function () {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('LoginsApiService', LoginsApiService);

    LoginsApiService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function LoginsApiService($resource, HOST) {

        var api = $resource(HOST.URL + '/rest/1/logins', {}, {
            getCurrent: {  method: 'GET', url: HOST.URL + '/rest/1/logins/current'},
            listLogins: {  method: 'GET', url: HOST.URL + '/rest/1/admin/logins', isArray: true},
            addLogin: {  method: 'POST', params: {accountId: '@accountId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/logins'},
            deleteLogin: {  method: 'DELETE', params: {accountId: '@accountId', loginId: '@loginId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/logins/:loginId'},
            changeNameForLogin: {  method: 'POST', params: { accountId: '@accountId', loginId: '@loginId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/logins/:loginId/changename'},
            setPasswordForLogin: {  method: 'POST', params: { accountId: '@accountId', loginId: '@loginId'}, url: HOST.URL + '/rest/1/admin/accounts/:accountId/logins/:loginId/setpassword'},

        });

        var service = {
            getCurrent: getCurrent,
            listLogins: listLogins,
            addLogin: addLogin,
            deleteLogin: deleteLogin,
            changeNameForLogin: changeNameForLogin,
            setPasswordForLogin: setPasswordForLogin
        };
        return service;

        //////////////////////////////////////////////////////////////////////////////////////////////////////

        function getCurrent() {
            return api.getCurrent();
        }

        function listLogins() {
            return api.listLogins();
        }

        function addLogin(account, name, password) {
            return api.addLogin({accountId: account.id},{ userName: name, password: password });
        }

        function deleteLogin(login) {
            return api.deleteLogin({accountId: login.accountId, loginId: login.id});
        }

        function changeNameForLogin(login, name) {
            return api.changeNameForLogin({accountId: login.accountId, loginId: login.id},{ userName: name });
        }

        function setPasswordForLogin(login, password) {
            return api.setPasswordForLogin({accountId: login.accountId, loginId: login.id},{ newPassword: password });
        }

    }

})();