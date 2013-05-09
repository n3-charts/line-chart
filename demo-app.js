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
  var colors = d3.scale.category10()
  
  $scope.sinusodize = function() {
    $scope.options = {series: []};
    
    $scope.data = [];
    for (var i = 0; i < 5; i++) {
      $scope.options.series.push({
        y: 'series_' + i,
        color: colors(i)
      });
      
      for (var j = 0; j < 50; j++) {
        var row = $scope.data[j] || {x: j};
        
        row['series_' + i] = (Math.sin(j/5))*(5*i);
        
        $scope.data[j] = row;
      }
    }
  }
  
  $scope.randomize = function() {
    $scope.generate(
      Math.random()*10,
      Math.random()*100
    );
  }
  
  
  $scope.generate = function(seriesCount, rowCount) {
    $scope.options = {series: []};
    
    $scope.data = [];
    for (var i = 0; i < seriesCount; i++) {
      $scope.options.series.push({
        y: 'series_' + i,
        color: colors(i)
      });
      
      for (var j = 0; j < rowCount; j++) {
        var row = $scope.data[j] || {x: j};
        
        row['series_' + i] = (Math.random()).toFixed(5)*500;
        
        $scope.data[j] = row;
      }
    }
  }
  
  $scope.sinusodize();
}])