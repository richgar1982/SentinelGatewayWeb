(function () {
    'use strict';

    angular
        .module('api-sentinel')
        .factory('SentinelAccountApiService', SentinelAccountApiService);

    SentinelAccountApiService.$inject = ['$resource', 'SENTINEL_API_HOST_CONSTANTS'];
    function SentinelAccountApiService($resource, HOST) {

        var api = $resource(HOST.URL + '/rest/1/sentinels', {}, {
            getLatestAssignments: {method: 'GET', url: HOST.URL + '/rest/1/sentinels', isArray: true},
            getLatestAssignmentsCount: {method: 'GET', url: HOST.URL + '/rest/1/sentinels/count'}
        });

        var service = {
            getLatestAssignments: getLatestAssignments,
            getLatestAssignmentsCount: getLatestAssignmentsCount
        };
        return service;

        //////////////////////////////////////////////////////////////////////////////////////////////////////

        function getLatestAssignments(filter, page) {
            return api.getLatestAssignments({ filter: filter, page: page});
        }

        function getLatestAssignmentsCount(filter) {
            return api.getLatestAssignmentsCount({filter: filter});
        }
    }

})();