(function () {
    'use strict';

    angular
        .module('ui-common')
        .directive('localDatetime', LocalDatetimeDirective);

    function LocalDatetimeDirective() {
        var directive = {
            restrict: 'A',
            scope: {
                utcDatetime: '@',
                dateFormat: '@',
                timeFormat: '@'
            },
            template: '{{ localDatetimeString }}',
            link: link
        };
        return directive;

        function link(scope, element, attrs, controller) {
            scope.localDatetimeString = moment(attrs.utcDatetime).local().format(attrs.dateFormat + (attrs.timeFormat ? ' ' + attrs.timeFormat : ''));

            scope.$watch(
                function() {
                    return attrs;
                },
                function (value) {
                    if (!value.utcDatetime || isNaN(Date.parse(value.utcDatetime))) {
                        scope.localDatetimeString = '';
                        return;
                    }

                    scope.localDatetimeString = moment(value.utcDatetime).local().format(value.dateFormat + (value.timeFormat ? ' ' + value.timeFormat : ''));
                }, true
            );
        }
    }

})();