(function () {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('SentryAdminApiService', SentryAdminApiService);

    SentryAdminApiService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function SentryAdminApiService($resource, HOST) {

        var api = $resource(HOST.URL + '/rest/1/sentries', {}, {
            getLatestAssignmentsForAdmin: {method: 'GET', url: HOST.URL + '/rest/1/admin/sentry500s', isArray: true},
            getLatestAssignmentsCountForAdmin: {method: 'GET', url: HOST.URL + '/rest/1/admin/sentry500s/count'},
            getLatestAssignments: {method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s', isArray: true},
            getLatestAssignmentsCount: {method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s/count'},
            assignSentries: { method: 'POST', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s/assign'},
            backfillSentries: { method: 'POST', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s/backfill'},
            removeSentries: { method: 'POST', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s/remove'},
            removeSentry: { method: 'DELETE', params: { accountId: '@accountId', imei: '@imei' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s/:imei'},
            listLatestSentry500SentinelReports: { method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500reports/latest', isArray: true },
            countLatestSentry500SentinelReports: { method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500reports/latest/count' },
            listSentry500SentinelReports: { method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500reports', isArray: true },
            countSentry500SentinelReports: { method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500reports/count' },
            listSentry500SentinelReportsByDevice: { method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s/:imei/reports', isArray: true },
            countSentry500SentinelReportsByDevice: { method: 'GET', params: { accountId: '@accountId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500s/:imei/reports/count' },
            getReport: { method: 'GET', params: { accountId: '@accountId', reportId: '@reportId' }, url: HOST.URL + '/rest/1/admin/accounts/:accountId/sentry500reports/:reportId' },
        });

        var service = {
            getLatestAssignmentsForAdmin: getLatestAssignmentsForAdmin,
            getLatestAssignmentsCountForAdmin: getLatestAssignmentsCountForAdmin,
            getLatestAssignments: getLatestAssignments,
            getLatestAssignmentsCount: getLatestAssignmentsCount,
            searchLatestAssignmentsForAdmin: searchLatestAssignmentsForAdmin,
            assignSentries: assignSentries,
            backfillSentries: backfillSentries,
            removeSentries: removeSentries,
            removeSentry: removeSentry,
            listLatestSentry500SentinelReports: listLatestSentry500SentinelReports,
            countLatestSentry500SentinelReports: countLatestSentry500SentinelReports,
            listSentry500SentinelReports: listSentry500SentinelReports,
            countSentry500SentinelReports: countSentry500SentinelReports,
            listSentry500SentinelReportsByDevice: listSentry500SentinelReportsByDevice,
            countSentry500SentinelReportsByDevice: countSentry500SentinelReportsByDevice,
            getReport: getReport
        };
        return service;

        //////////////////////////////////////////////////////////////////////////////////////////////////////

        function getLatestAssignmentsForAdmin(filter, page) {
            return api.getLatestAssignmentsForAdmin({ filter: filter, page: page});
        }

        function assignSentries(account, imeiList) {
            return api.assignSentries({ accountId: account.id}, { imeiNumbers: imeiList });
        }

        function removeSentries(accountId, imeiList) {
            return api.removeSentries({ accountId: accountId }, { imeiNumbers: imeiList });
        }

        function removeSentry(accountId, imei) {
            return api.removeSentry({ accountId: accountId, imei: imei });
        }

        function backfillSentries(account, imeiList, fromDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            return api.backfillSentries({ accountId: account.id}, { imeiNumbers: imeiList, timeOfAssignment: fromDateIso });
        }

        function searchLatestAssignmentsForAdmin(pattern) {
            return api.getLatestAssignmentsForAdmin({ search: pattern});
        }

        function getLatestAssignmentsCountForAdmin(filter) {
            return api.getLatestAssignmentsCountForAdmin({filter: filter});
        }

        function listLatestSentry500SentinelReports(account, page) {
            return api.listLatestSentry500SentinelReports({ accountId: account.id, page: page});
        }

        function countLatestSentry500SentinelReports(account) {
            return api.countLatestSentry500SentinelReports({ accountId: account.id});
        }

        function listSentry500SentinelReports(account, fromDate, toDate, page) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.listSentry500SentinelReports({ accountId: account.id, from: fromDateIso, to: toDateIso, page: page});
        }

        function countSentry500SentinelReports(account, fromDate, toDate) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.countSentry500SentinelReports({ accountId: account.id, from: fromDateIso, to: toDateIso});
        }

        function listSentry500SentinelReportsByDevice(account, imei, fromDate, toDate, page, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.listSentry500SentinelReportsByDevice({ accountId: account.id, imei: imei, from: fromDateIso, to: toDateIso, page: page, itemsPerPage: itemsPerPage});
        }

        function countSentry500SentinelReportsByDevice(account, imei, fromDate, toDate, itemsPerPage) {
            var fromDateIso = (fromDate instanceof moment) ? fromDate.toISOString() : moment(fromDate).toISOString();
            var toDateIso = (toDate instanceof moment) ? toDate.toISOString() : moment(toDate).toISOString();

            return api.countSentry500SentinelReportsByDevice({ accountId: account.id, imei: imei, from: fromDateIso, to: toDateIso, itemsPerPage: itemsPerPage});
        }

        function getReport(account, reportId) {
            return api.getReport({ accountId: account.id, reportId: reportId });
        }

        function getLatestAssignments(account, filter, page) {
            return api.getLatestAssignments({ accountId: account.id, filter: filter, page: page});
        }        

        function getLatestAssignmentsCount(account, filter) {
            return api.getLatestAssignmentsCount({ accountId: account.id, filter: filter});
        }
    }

})();