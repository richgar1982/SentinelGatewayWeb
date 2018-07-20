(function() {
    'use strict';

    angular
        .module('ui-sentinel.sentinel')
        .controller('SentinelAssignmentController', SentinelAssignmentController);

    /////////////

    SentinelAssignmentController.$inject = ['$rootScope', '$state', 'SentinelUiSession', 'SentinelAdminApiService', 'SentinelAccountApiService'];
    function SentinelAssignmentController($rootScope, $state, SentinelUiSession, SentinelAdminApiService, SentinelAccountApiService) {
        var vm = {
            latestList: null,
            filter: 'all',
            page: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 500,
            load: load
        };
        activate();
        return vm;

        function activate() {
            load();
        }

        function load() {
            vm.latestList = null;

            var countPromise = SentinelUiSession.user.isAnAdmin ?
                SentinelAdminApiService.getLatestAssignmentsCount(SentinelUiSession.focus, vm.filter).$promise :
                SentinelAccountApiService.getLatestAssignmentsCount(vm.filter).$promise;
            var listPromise= SentinelUiSession.user.isAnAdmin ?
                SentinelAdminApiService.getLatestAssignments(SentinelUiSession.focus, vm.filter, vm.page).$promise :
                SentinelAccountApiService.getLatestAssignments(vm.filter, vm.page).$promise;

            countPromise.then(
                function(result) {
                    vm.totalPages = result.pageCount;
                    vm.totalItems = result.itemCount;
                },
                function (error) {
                    console.log(error);
                }
            );

            listPromise.then(
                function(result) {
                    vm.latestList = result;
                },
                function (error) {
                    console.log(error);
                }
            );
        }
    }

})();