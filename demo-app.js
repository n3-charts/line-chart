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
        var row = $scope.data[j] || {x: j};
        
        row['series_' + i] = (Math.random()).toFixed(5)*500;
        
        $scope.data[j] = row;
      }
    }
  }
  
  $scope.generate(5, 50)
}])