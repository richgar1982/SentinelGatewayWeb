(function() {
    'use strict';

    angular
        .module('ui-sentinel.sightings')
        .controller('SightingsForReportController', SightingsForReportController);

    /////////////

    SightingsForReportController.$inject = ['$rootScope', '$scope', '$state', 'SentinelUiSession', 'SightingsAdminApiService', 'SentryAdminApiService', 'SightingsAccountApiService', 'SentryAccountApiService'];
    function SightingsForReportController($rootScope, $scope, $state, SentinelUiSession, SightingsAdminApiService, SentryAdminApiService, SightingsAccountApiService, SentryAccountApiService) {
        var googleMapDivId = 'sightingsMap';


        var vm = {
            list: null,
            report: null,
            map: null,
            marker: null,
            page: 1,
            totalPages: 1,
            totalItems: 0,
            pageArray: null,
            itemsPerPage: 500,
            error: false,
            load: load,
            next: next,
            previous: previous,
            gotoPage: gotoPage
        };
        activate();
        return vm;

        function activate() {
            // $scope.$watchCollection(
            //     function() {
            //         return vm.report;
            //     },
            //     function(report) {
            //         //return report;
            //     }
            // );
            
            vm.report = $state.params.report;
            if (!vm.report) {
                vm.error = false;
                var reportPromise = SentinelUiSession.user.isAnAdmin ?
                    SentryAdminApiService.getReport(SentinelUiSession.focus, $state.params.reportId).$promise :
                    SentryAccountApiService.getReport($state.params.reportId).$promise;
                reportPromise.then(
                    function (report) {
                        vm.report = report;
                        load();
                    },
                    function (error) {
                        vm.error = true;
                        console.log(error);
                    }
                );
                
                return;
            }

            load();
        }

        function load() {
            vm.list = null;
            vm.page = 1;

            if (!vm.report) {
                return;
            }

            initMap();

            var countPromise = SentinelUiSession.user.isAnAdmin ?
                SightingsAdminApiService.countSightingsForReport(SentinelUiSession.focus, vm.report.imei, vm.report.reportId).$promise :
                SightingsAccountApiService.countSightingsForReport(vm.report.imei, vm.report.reportId).$promise;
            var listPromise = SentinelUiSession.user.isAnAdmin ?
                SightingsAdminApiService.listSightingsForReport(SentinelUiSession.focus, vm.report.imei, vm.report.reportId, vm.page).$promise :
                SightingsAccountApiService.listSightingsForReport(vm.report.imei, vm.report.reportId, vm.page).$promise;

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

        function initMap() {
            console.log(vm.report);
            if (!vm.report || vm.report.locationMethod === 'none') {
                return;
            }

            vm.map = new google.maps.Map(document.getElementById(googleMapDivId), {
                zoom: 8,
                minZoom: 2,
                center: {
                    lat: vm.report.latitude,
                    lng: vm.report.longitude
                },
                mapTypeId: google.maps.MapTypeId.HYBRID,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.TERRAIN]
                }
            });

            vm.marker = new google.maps.Marker({
                id: vm.report.reportGuid,
                position: {
                    lat: vm.report.latitude,
                    lng: vm.report.longitude
                },
                map: vm.map
            });
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

            var listPromise = SentinelUiSession.user.isAnAdmin ?
                SightingsAdminApiService.listSightingsForReport(SentinelUiSession.focus, vm.report.imei, vm.report.reportId, vm.page).$promise :
                SightingsAccountApiService.listSightingsForReport(vm.report.imei, vm.report.reportId, vm.page).$promise;
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