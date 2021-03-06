(function() {
    'use strict';

    angular
        .module('ui-sentinel.sightings')
        .controller('SightingsByDeviceController', SightingsByDeviceController);

    /////////////

    SightingsByDeviceController.$inject = ['$rootScope', '$state', 'SentinelUiSession', 'SightingsAdminApiService', 'SightingsAccountApiService'];
    function SightingsByDeviceController($rootScope, $state, SentinelUiSession, SightingsAdminApiService, SightingsAccountApiService) {
        var pageViews = [
            {
                name: 'hours',
                title: 'Sightings in last few hours',
                icon: 'fa-hourglass-o'
            },
            {
                name: 'range',
                title: 'Sightings in a date range',
                icon: 'fa-calendar'
            }
        ];
        
        var vm = {
            list: null,
            imei: $state.params.imei,
            page: 1,
            totalPages: 1,
            totalItems: 0,
            pageArray: null,
            itemsPerPage: 500,
            hoursText: 8,
            fromText: $state.params.from, //todo: fix when passed in from a report (which is UTC) should be local
            toText: $state.params.to,
            changeView: changeView,
            currentPageView: {
                name: 'range',
                title: 'Sightings in a date range',
                icon: 'fa-calendar'
            },
            pageViews: pageViews,
            load: load,
            next: next,
            previous: previous,
            gotoPage: gotoPage,
            gotoSightingsForReport: gotoSightingsForReport
        };
        activate();
        return vm;

        function activate() {
            if ($state.params.view) {
                changeView($state.params.view);
            }
            load();
        }

        function changeView(viewName) {
            // if (viewName === 'assign') {
            //     assignCancel();
            // }
            var view = _.find(vm.pageViews, function(v) {
                return v.name === viewName;
            });
            if (view !== undefined) {
                vm.currentPageView = view;
            }
        }

        function load() {
            vm.list = null;
            vm.page = 1;

            if (!vm.imei) {
                return;
            }
            var countPromise;
            var listPromise;
            if (vm.currentPageView.name === 'latest') {
                countPromise = SentinelUiSession.user.isAnAdmin ?
                    SightingsAdminApiService.countSightingsForDevice(SentinelUiSession.focus, vm.imei, vm.itemsPerPage).$promise :
                    SightingsAccountApiService.countSightingsForDevice(vm.imei, vm.itemsPerPage).$promise;
                listPromise = SentinelUiSession.user.isAnAdmin ?
                    SightingsAdminApiService.listSightingsForDevice(SentinelUiSession.focus, vm.imei, vm.page, vm.itemsPerPage).$promise :
                    SightingsAccountApiService.listSightingsForDevice(vm.imei, vm.page, vm.itemsPerPage).$promise;
            }
            else {
                var from;
                var to;
                if (vm.currentPageView.name === 'hours') {
                    from = moment().subtract(vm.hoursText, 'hour');
                    to = moment();
                }
                else {
                    from = moment(vm.fromText);
                    to = moment(vm.toText);
                }

                countPromise = SentinelUiSession.user.isAnAdmin ?
                    SightingsAdminApiService.countSightingsForDevice(SentinelUiSession.focus, vm.imei, from, to, vm.itemsPerPage).$promise :
                    SightingsAccountApiService.countSightingsForDevice(vm.imei, from, to, vm.itemsPerPage).$promise;
                listPromise = SentinelUiSession.user.isAnAdmin ?
                    SightingsAdminApiService.listSightingsForDevice(SentinelUiSession.focus, vm.imei, from, to, vm.page, vm.itemsPerPage).$promise :
                    SightingsAccountApiService.listSightingsForDevice(vm.imei, from, to, vm.page, vm.itemsPerPage).$promise;
            }

            countPromise.then(
                function(result) {
                    vm.totalPages = result.pageCount;
                    vm.totalItems = result.itemCount;
                    
                    var pageArray = [];
                    for (var i = 1; i <= vm.totalPages; i++) {
                        pageArray.push(i);
                    }
                    vm.pageArray = pageArray;
                },
                function (error) {
                    console.log(error);
                }
            );

            listPromise.then(
                function(result) {
                    vm.list = result;
                },
                function (error) {
                    console.log(error);
                }
            );
        }

        function next() {
            gotoPage(vm.page + 1);
        }

        function previous() {
            gotoPage(vm.page - 1);
        }

        function gotoPage(page) {
            if (page < 1 || page > vm.totalPages) {
                return;
            }
            vm.list = null;
            vm.page = page;
            var from = moment(vm.fromText);
            var to = moment(vm.toText);
            var listPromise = SentinelUiSession.user.isAnAdmin ?
                SightingsAdminApiService.listSightingsForDevice(SentinelUiSession.focus, vm.imei, from, to, vm.page, vm.itemsPerPage).$promise :
                SightingsAccountApiService.listSightingsForDevice(vm.imei, from, to, vm.page, vm.itemsPerPage).$promise;
            listPromise.then(
                function(result) {
                    vm.list = result;
                },
                function (error) {
                    console.log(error);
                }
            );
        }

        function gotoSightingsForReport(sighting) {
            $state.go('sightings.for-report', { reportId: sighting.reportId });
        }


    }

})();