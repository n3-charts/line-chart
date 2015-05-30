/// <reference path='../typings/tsd.d.ts' />

/// <reference path='utils/Event.ts' />
/// <reference path='utils/Factory.ts' />
/// <reference path='factories/Container.ts' />
/// <reference path='factories/Axis.ts' />

/// <reference path='linechart.ts' />

module n3Charts {
  'use strict';

  // Create the angular module
  angular.module('n3-line-chart', [])

    // and our services
    .service('n3FactoryManager', Utils.FactoryManager)
    .service('n3EventManager', Utils.EventManager)

    // and our directives
    .directive('linechart', LineChart.factory());
}