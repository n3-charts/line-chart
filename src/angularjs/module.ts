/// <reference path='../../typings/browser.d.ts' />
/// <reference path='./LineChart.ts' />

// Create the angular module
angular.module('n3-line-chart', [])
  // and our directives
  .directive('linechart', [
    '$window', '$parse', '$timeout', '$rootScope',
    ($window, $parse, $timeout, $rootScope) => new n3Charts.LineChart($window, $parse, $timeout, $rootScope)
  ]);
