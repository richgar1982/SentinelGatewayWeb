(function() {
    'use strict';

    angular
        .module('ui-sentinel.sentry-reports')
        .controller('LatestSentryReportsController', LatestSentryReportsController);

    /////////////

    LatestSentryReportsController.$inject = ['$rootScope', '$state', 'SentinelUiSession', 'SentryAdminApiService', 'SentryAccountApiService', 'SeparationSelectionService'];
    function LatestSentryReportsController($rootScope, $state, SentinelUiSession, SentryAdminApiService, SentryAccountApiService, SeparationSelectionService) {
        var pageViews = [
            {
                name: 'latest',
                title: 'Latest Reports',
                icon: 'fa-clock-o'
            },
            {
                name: 'hours',
                title: 'Reports in last few hours',
                icon: 'fa-hourglass-o'
            },
            {
                name: 'range',
                title: 'Reports in a date range',
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
                title: 'Latest Reports',
                icon: 'fa-clock-o'
            },
            pageViews: pageViews,
            load: load,
            gotoDeviceReports: gotoDeviceReports,
            gotoSightingsForReport: gotoSightingsForReport,
            gotoSightingsByDevice: gotoSightingsByDevice,
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
                    SentryAdminApiService.countLatestSentry500SentinelReports(SentinelUiSession.focus).$promise :
                    SentryAccountApiService.countLatestSentry500SentinelReports().$promise;
                listPromise = SentinelUiSession.user.isAnAdmin ?
                    SentryAdminApiService.listLatestSentry500SentinelReports(SentinelUiSession.focus, vm.page).$promise :
                    SentryAccountApiService.listLatestSentry500SentinelReports(vm.page).$promise;
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
                    SentryAdminApiService.countSentry500SentinelReports(SentinelUiSession.focus, from, to).$promise :
                    SentryAccountApiService.countSentry500SentinelReports(from, to).$promise;
                listPromise = SentinelUiSession.user.isAnAdmin ?
                    SentryAdminApiService.listSentry500SentinelReports(SentinelUiSession.focus, from, to, vm.page).$promise :
                    SentryAccountApiService.listSentry500SentinelReports(from, to, vm.page).$promise;
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
            var from = moment(report.timeOfReceipt).subtract(1, 'days').toISOString();
            var to = moment(report.timeOfReceipt).add(60, 'minutes').toISOString();
            $state.go('sentry-reports.by-device', { imei: report.imei, view: 'prior', to: to, from: from});
        }

        function gotoSightingsForReport(report) {
            $state.go('sightings.for-report', { reportId: report.reportId, report: report});
        }

        function gotoSightingsByDevice(report) {
            var from = moment(report.timeOfReceipt).subtract(1, 'days').toISOString();
            var to = moment(report.timeOfReceipt).add(60, 'minutes').toISOString();
            $state.go('sightings.by-device', { imei: report.imei, to: to, from: from});
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
                SentryAdminApiService.listSentry500SentinelReports(SentinelUiSession.focus, from, to, vm.page).$promise :
                SentryAccountApiService.listSentry500SentinelReports(from, to, vm.page).$promise;
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