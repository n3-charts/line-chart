/// <reference path='../typings/jquery/jquery.d.ts' />
/// <reference path='../typings/angularjs/angular.d.ts' />
/// <reference path='../typings/d3/d3.d.ts' />

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
