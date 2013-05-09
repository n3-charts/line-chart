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
  $scope.randomize = function() {
    $scope.generate(
      Math.random()*10,
      Math.random()*100
    );
  }
  
  var colors = d3.scale.category10()
  
  $scope.generate = function(seriesCount, rowCount) {
    
    $scope.options = {series: []};
    
    $scope.data = [];
    for (var i = 0; i < seriesCount; i++) {
      $scope.options.series.push({
        y: 'series_' + i,
        color: colors(i)
      });
      
      for (var j = 0; j < rowCount; j++) {
        var row = $scope.data[j] || {x: Math.random() + j};
        
        row['series_' + i] = Math.random()*500;
        
        $scope.data[j] = row;
      }
    }
  }
  
  
  $scope.data = [
    {x: 0, value: 4, otherValue: 32 },
    {x: 1, value: 8, otherValue: 27 },
    {x: 2, value: 15, otherValue: 12 },
    {x: 3, value: 16, otherValue: 0 },
    {x: 4, value: 230, otherValue: -3 },
    {x: 5, value: 42, otherValue: -4 }
  ];
  
  $scope.options = {
    series: [
      {y: 'value', color: 'steelblue'},
      {y: 'otherValue', color: '#AEBC21'},
      {y: 'x', color: '#8DC3E9'}
    ]
  }
}])