angular.module('v2App', ['n3-line-chart', 'apojop', 'ngRoute', 'home', 'examples'])

.config(['$routeProvider', function config($routeProvider) {
  $routeProvider
  .when('/home', {controller: 'HomeCtrl', templateUrl: 'src/home.html'})
  .when('/examples', {controller: 'ExamplesCtrl', templateUrl: 'src/examples.html'})
  .otherwise({redirectTo: '/home'});
}])

.controller('BodyCtrl', function($scope, $location) {
  $scope.$on('$locationChangeSuccess', function(next, current) {
    $scope.path = $location.path().replace(/^\//, '') || 'home';
  });

  $scope.isActive = function(route) {
    return $location.path() === route;
  };
})

;
