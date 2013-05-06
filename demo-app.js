'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'n3-charts.linechart'
])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/default', {templateUrl: 'demo-partial.html', controller: 'DemoCtrl'});
    $routeProvider.otherwise({redirectTo: '/default'});
  }])

.controller('DemoCtrl', ['$scope', function($scope) {
  $scope.data = [
    {x: 0, value: 4},
    {x: 1, value: 8},
    {x: 2, value: 15},
    {x: 3, value: 16},
    {x: 4, value: 23},
    {x: 5, value: 42}
  ];
  
  $scope.options = {
    series: [
      {y: 'value', color: 'steelblue'}
    ]
  }
}])