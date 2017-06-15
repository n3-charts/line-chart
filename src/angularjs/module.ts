import * as ng from 'angular';
import * as n3Charts from './LineChart';

// Create the angular module
ng.module('n3-line-chart', [])
  // and our directives
  .directive('linechart', [
    '$window', '$parse', '$timeout', '$rootScope',
    ($window, $parse, $timeout, $rootScope) => new n3Charts.LineChart($window, $parse, $timeout, $rootScope)
  ]);
