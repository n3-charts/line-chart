/// <reference path='../typings/tsd.d.ts' />

/// <reference path='utils/_index.ts' />
/// <reference path='styles/_index.ts' />
/// <reference path='factories/_index.ts' />

/// <reference path='LineChart.ts' />

module n3Charts {
  'use strict';
  // Create the angular module
  angular.module('n3-line-chart', [])
    // and our directives
    .directive('linechart', () => new LineChart());
}
