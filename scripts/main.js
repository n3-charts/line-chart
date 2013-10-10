angular.module('demo.main', ['n3-charts.linechart', 'demo.examples'])

.config(['$routeProvider', function config($routeProvider) {
  $routeProvider
  .when('/examples', {controller: 'ExamplesCtrl', templateUrl: 'views/examples.html'})
  .when('/', {controller: 'HomeCtrl', templateUrl: 'views/home.html'})
  .otherwise({redirectTo: '/'});
}])

.controller('HomeCtrl', function($scope) {
  var generate = function() {
    var data = [];
    var r = function(a) {return parseInt(a*1000)/1000;};
    
    for (var x = 0.01; x<0.04; x+=0.001) {
      data.push({x: r(x), y: r(x*Math.sin((1/x)))});
    }
    return data;
  };
  
  $scope.data = generate();
  $scope.options = {series: [
    {y: 'x', type: 'line'},
    {y: 'y', type: 'column', color: '#48AB4D'}
  ], lineMode: 'cardinal'};
  
})

;