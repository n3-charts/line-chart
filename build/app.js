/// <reference path='../typings/tsd.d.ts' />
/// <reference path='utils/Event.ts' />
/// <reference path='utils/Factory.ts' />
/// <reference path='factories/Container.ts' />
/// <reference path='factories/Axis.ts' />
/// <reference path='linechart.ts' />
var n3Charts;
(function (n3Charts) {
    'use strict';
    // Create the angular module
    angular.module('n3-line-chart', [])
        .service('n3FactoryManager', n3Charts.Utils.FactoryManager)
        .service('n3EventManager', n3Charts.Utils.EventManager)
        .directive('linechart', n3Charts.LineChart.factory());
})(n3Charts || (n3Charts = {}));
//# sourceMappingURL=app.js.map