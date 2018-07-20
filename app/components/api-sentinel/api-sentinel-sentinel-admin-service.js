(function () {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('SentinelAdminApiService', SentinelAdminApiService);

    SentinelAdminApiService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function SentinelAdminApiService($resource, HOST) {

        var api = $resource(HOST.URL + '/rest/1/sentinels', {}, {
            getLatestAssignmentsForAdmin: {method: 'GET', url: HOST.URL + '/rest/1/admin/sentinels', isArray: true},
            getLatestAssignmentsCountForAdmin: {method: 'GET', url: HOST.URL + '/rest/1/admin/sentinels/count'},
            getLatestAssignments: {method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentinels', isArray: true},
            getLatestAssignmentsCount: {method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentinels/count'},
            assignSentinels: { method: 'POST', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentinels/assign'},
            backfillSentinels: { method: 'POST', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentinels/backfill'},
            removeSentinels: { method: 'POST', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentinels/remove'},
            removeSentinel: { method: 'DELETE', params: { accountId: '@accountId', imei: '@mac' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentinels/:mac'}
        });

        var service = {
            getLatestAssignmentsForAdmin: getLatestAssignmentsForAdmin,
            getLatestAssignmentsCountForAdmin: getLatestAssignmentsCountForAdmin,
            getLatestAssignments: getLatestAssignments,
            getLatestAssignmentsCount: getLatestAssignmentsCount,
            searchLatestAssignmentsForAdmin: searchLatestAssignmentsForAdmin,
            assignSentinels: assignSentinels,
            backfillSentinels: backfillSentinels,
            removeSentinels: removeSentinels,
            removeSentinel: removeSentinel
        };
        return service;

        //////////////////////////////////////////////////////////////////////////////////////////////////////

        function getLatestAssignmentsForAdmin(filter, page) {
            return api.getLatestAssignmentsForAdmin({ filter: filter, page: page});
        }

        function assignSentinels(account, macList) {
            return api.assignSentinels({ accountId: account.id}, { macNumbers: macList });
        }

        function removeSentinels(accountId, macList) {
            return api.removeSentinels({ accountId: accountId }, { macNumbers: macList });
        }

        function removeSentinel(accountId, mac) {
            return api.removeSentinel({ accountId: accountId, mac: mac });
        }

        function backfillSentinels(account, macList, fromDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            return api.backfillSentinels({ accountId: account.id}, { macNumbers: macList, timeOfAssignment: fromDateIso });
        }

        function searchLatestAssignmentsForAdmin(pattern) {
            return api.getLatestAssignmentsForAdmin({ search: pattern});
        }

        function getLatestAssignmentsCountForAdmin(filter) {
            return api.getLatestAssignmentsCountForAdmin({filter: filter});
        }

        function getLatestAssignments(account, filter, page) {
            return api.getLatestAssignments({ accountId: account.id, filter: filter, page: page});
        }

        function getLatestAssignmentsCount(account, filter) {
            return api.getLatestAssignmentsCount({accountId: account.id, filter: filter});
        }
    }

})();