(function() {
    'use strict';

    angular
        .module('ui-sentinel.sentry')
        .controller('SentryAdminController', SentryAdminController);

    /////////////

    SentryAdminController.$inject = ['$rootScope', '$state', 'SentryAdminApiService', 'AccountApiService'];
    function SentryAdminController($rootScope, $state, SentryAdminApiService, AccountApiService) {
        var pageViews = [
            {
                name: 'assign',
                title: 'Assign',
                icon: 'fa-plus'
            },
            {
                name: 'list',
                title: 'Availability',
                icon: 'fa-list'
            },
            {
                name: 'search',
                title: 'Search',
                icon: 'fa-binoculars'
            }
        ];
        
        var vm = {
            accounts: null,
            assignAccount: null,
            assignImeiText: null,
            assignIsBackfill: false,
            assignBackfillFrom: null,
            latestList: null,
            filter: 'all',
            searchText: null,
            searchResults: null,
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
            search: search,
            load: load,
            assignSubmit: assignSubmit,
            assignCancel: assignCancel,
            removeAssignment: null,
            removeInProgress: false,
            removeBegin: removeBegin,
            removeCancel: removeCancel,
            removeSubmit: removeSubmit
        };
        activate();
        return vm;

        function activate() {
            load();
            loadAccounts();
        }

        function changeView(viewName) {
            if (viewName === 'assign') {
                assignCancel();
            }
            var view = _.find(vm.pageViews, function(v) {
                return v.name === viewName;
            });
            if (view !== undefined) {
                vm.currentPageView = view;
            }
        }

        function load() {
            vm.latestList = null;
            var pagePromise = SentryAdminApiService.getLatestAssignmentsCountForAdmin(vm.filter).$promise;
            pagePromise.then(
                function(result) {
                    vm.totalPages = result.pageCount;
                    vm.totalItems = result.itemCount;
                },
                function (error) {
                    console.log(error);
                }
            );

            var listPromise = SentryAdminApiService.getLatestAssignmentsForAdmin(vm.filter, vm.page).$promise;
            listPromise.then(
                function(result) {
                    vm.latestList = result;
                },
                function (error) {
                    console.log(error);
                }
            );
        }

        function loadAccounts() {
            var listPromise = AccountApiService.listAccounts().$promise;
            listPromise.then(
                function(result) {
                    vm.accounts = result;
                },
                function (error) {
                    console.log(error);
                }
            );
        }

        function search() {
            vm.latestList = null;
            var listPromise = SentryAdminApiService.searchLatestAssignmentsForAdmin(vm.searchText).$promise;
            listPromise.then(
                function(result) {
                    vm.latestList = result;
                    vm.totalPages = 1;
                    vm.totalItems = result.length;
                },
                function (error) {
                    console.log(error);
                }
            );
        }
        
        function assignCancel() {
            vm.assignAccount = null;
            vm.assignImeiText = null;
            vm.assignBackfillFrom = null;
        }
        
        function assignSubmit() {
            if (!vm.assignAccount || !vm.assignImeiText) {
                return;
            }
            
            var imeiList = _.split(vm.assignImeiText, '\n');
            if (vm.assignIsBackfill) {
                var backfillPromise = SentryAdminApiService.backfillSentries(vm.assignAccount, imeiList, vm.assignBackfillFrom).$promise;
                backfillPromise.then(
                    function(result) {
                        load();
                        assignCancel();
                        changeView('list');
                    },
                    function (error) {
                        console.log(error);
                    }
                );
                return;
            }

            var assignPromise = SentryAdminApiService.assignSentries(vm.assignAccount, imeiList).$promise;
            assignPromise.then(
                function(result) {
                    load();
                    assignCancel();
                    changeView('list');
                },
                function (error) {
                    console.log(error);
                }
            );
        }
        
        function removeBegin(assignment) {
            vm.removeInProgress = true;
            vm.removeAssignment = assignment;
        }
        
        function removeCancel() {
            vm.removeInProgress = false;
            vm.removeAssignment = null;
        }
        
        function removeSubmit() {
            if (!vm.removeAssignment || !vm.removeAssignment.latestAssignment ) {
                return;
            }

            var promise = SentryAdminApiService.removeSentry(vm.removeAssignment.latestAssignment.accountId, vm.removeAssignment.imei).$promise;
            promise.then(
                function(result) {
                    load();
                    removeCancel();
                },
                function (error) {
                    console.log(error);
                }
            );
        }

    }

})();