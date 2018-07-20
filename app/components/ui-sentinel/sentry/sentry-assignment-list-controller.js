(function() {
    'use strict';

    angular
        .module('ui-sentinel.sentry')
        .controller('SentryAssignmentListController', SentryAssignmentListController);

    /////////////

    SentryAssignmentListController.$inject = ['$rootScope', '$state', 'SentinelUiSession', 'SentryAdminApiService', 'SentryAccountApiService'];
    function SentryAssignmentListController($rootScope, $state, SentinelUiSession, SentryAdminApiService, SentryAccountApiService) {
        var pageViews = [
            {
                name: 'list',
                title: 'Availability',
                icon: 'fa-list'
            }
        ];
        
        var vm = {
            latestList: null,
            filter: 'all',
            page: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 500,
            pageViewTitle: '',
            changeView: changeView,
            currentPageView: {
                name: 'list',
                title: 'Availability',
                icon: 'fa-list'
            },
            pageViews: pageViews,
            load: load
        };
        activate();
        return vm;

        function activate() {
            load();
        }

        function changeView(viewName) {
            var view = _.find(vm.pageViews, function(v) {
                return v.name === viewName;
            });
            if (view !== undefined) {
                vm.currentPageView = view;
            }
        }

        function load() {
            vm.latestList = null;
            var countPromise = SentinelUiSession.user.isAnAdmin ?
                SentryAdminApiService.getLatestAssignmentsCount(SentinelUiSession.focus, vm.filter).$promise :
                SentryAccountApiService.getLatestAssignmentsCount(vm.filter).$promise;
            var listPromise= SentinelUiSession.user.isAnAdmin ?
                SentryAdminApiService.getLatestAssignments(SentinelUiSession.focus, vm.filter, vm.page).$promise :
                SentryAccountApiService.getLatestAssignments(vm.filter, vm.page).$promise;

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