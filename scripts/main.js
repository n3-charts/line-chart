angular.module('demo.main', ['n3-charts.linechart', 'demo.examples'])

.config(function config($routeProvider) {
  $routeProvider
  .when('/examples', {controller: 'ExamplesCtrl', templateUrl: 'views/examples.html'})
  .when('/', {templateUrl: 'views/home.html'})
  .otherwise({redirectTo: '/'});
})



;