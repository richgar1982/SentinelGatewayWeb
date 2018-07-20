(function() {
    'use strict';

    angular
        .module('ui-sentinel.sightings')
        .controller('LatestSightingsController', LatestSightingsController);

    /////////////

    LatestSightingsController.$inject = ['$rootScope', '$state', 'SentinelUiSession', 'SentryAdminApiService', 'SightingsAdminApiService', 'SentryAccountApiService', 'SightingsAccountApiService', 'SeparationSelectionService'];
    function LatestSightingsController($rootScope, $state, SentinelUiSession, SentryAdminApiService, SightingsAdminApiService, SentryAccountApiService, SightingsAccountApiService, SeparationSelectionService) {
        var pageViews = [
            {
                name: 'latest',
                title: 'Latest Sightings',
                icon: 'fa-clock-o'
            },
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
            page: 1,
            totalPages: 1,
            totalItems: 0,
            pageArray: null,
            itemsPerPage: 500,
            hoursText: 8,
            fromText: moment().subtract(8, 'hours').format('YYYY-MM-DDTHH:mm:ss'),
            toText: moment().format('YYYY-MM-DDTHH:mm:ss'),
            changeView: changeView,
            currentPageView: {
                name: 'latest',
                title: 'Latest Sightings',
                icon: 'fa-clock-o'
            },
            pageViews: pageViews,
            load: load,
            gotoDeviceReports: gotoDeviceReports,
            gotoSightingsForReport: gotoSightingsForReport,
            gotoSightingsByDevice: gotoSightingsByDevice,
            gotoSightingsOfMac: gotoSightingsOfMac,
            gotoSightingsPivotForDevice: gotoSightingsPivotForDevice,
            gotoSeparationSimulator: gotoSeparationSimulator,
            next: next,
            previous: previous,
            gotoPage: gotoPage
        };
        activate();
        return vm;

        function activate() {
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

            var countPromise;
            var listPromise;
            if (vm.currentPageView.name === 'latest') {
                countPromise = SentinelUiSession.user.isAnAdmin ?
                    SightingsAdminApiService.countLatestSightings(SentinelUiSession.focus).$promise :
                    SightingsAccountApiService.countLatestSightings().$promise;
                listPromise = SentinelUiSession.user.isAnAdmin ?
                    SightingsAdminApiService.latestSightings(SentinelUiSession.focus, vm.page).$promise :
                    SightingsAccountApiService.latestSightings(vm.page).$promise;
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
                    SightingsAdminApiService.countSightings(SentinelUiSession.focus, from, to).$promise :
                    SightingsAccountApiService.countSightings(from, to).$promise;
                listPromise = SentinelUiSession.user.isAnAdmin ?
                    SightingsAdminApiService.listSightings(SentinelUiSession.focus, from, to, vm.page).$promise :
                    SightingsAccountApiService.listSightings(from, to, vm.page).$promise;
            }

            if (!countPromise || !listPromise) {
                return;
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

        function gotoDeviceReports(report) {
            var from = moment(report.timeOfReport).subtract(1, 'days').toISOString();
            $state.go('sentry-reports.by-device', { imei: report.imei, view: 'prior', to: report.timeOfReport, from: from});
        }

        function gotoSightingsForReport(sighting) {
            var reportPromise = SentinelUiSession.user.isAnAdmin ?
                SentryAdminApiService.getReport(SentinelUiSession.focus, sighting.reportId).$promise :
                SentryAccountApiService.getReport(sighting.reportId).$promise;
            reportPromise.then(
                function (report) {
                    $state.go('sightings.for-report', { reportId: report.reportId, report: report});
                },
                function (error) {
                    console.log(error);
                }
            );

        }

        function gotoSightingsByDevice(report) {
            var from = moment(report.timeOfReport).subtract(1, 'days').toISOString();
            $state.go('sightings.by-device', { imei: report.imei, to: report.timeOfReport, from: from});
        }

        function gotoSightingsOfMac(report) {
            var from = moment(report.timeOfReport).subtract(1, 'days').toISOString();
            $state.go('sightings.of-mac', { mac: report.mac, to: report.timeOfReport, from: from});
        }

        function gotoSightingsPivotForDevice(report) {
            $state.go('sightings.pivot', { imei: report.imei, lastReport: report});
        }

        function gotoSeparationSimulator(report) {
            SeparationSelectionService.setSentry(report.imei);
            $state.go('simulators.separation', { imei: report.imei, lastReport: report});
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
            var listPromise = SentinelUiSession.user.isAnAdmin ?
                SentryAdminApiService.listSentry500SentinelReportsForAccount(SentinelUiSession.focus, from, to, vm.page).$promise :
                SightingsAccountApiService.listSentry500SentinelReports(from, to, vm.page).$promise;
            listPromise.then(
                function(result) {
                    vm.list = result;
                },
                function (error) {
                    console.log(error);
                }
            );
        }
    }

})();