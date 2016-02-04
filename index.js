angular.module('v2App', ['n3-line-chart', 'apojop', 'ngRoute', 'home', 'docs', 'migration', 'examples'])

.config(['$routeProvider', function config($routeProvider) {
  $routeProvider
  .when('/home', {controller: 'HomeCtrl', templateUrl: 'src/home.html'})
  .when('/docs', {controller: 'DocsCtrl', templateUrl: 'src/docs.html'})
  .when('/migration', {controller: 'MigrationCtrl', templateUrl: 'src/migration.html'})
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

.directive('classIfRoute', function($location) {
  return {
    restrict: 'A',
    link: function(scope, elm, attrs) {
      var bits = attrs.classIfRoute.split(':');

      scope.$on('$locationChangeSuccess', function() {
        if ($location.path() === bits[1]) {
          elm.addClass(bits[0]);
        } else {
          elm.removeClass(bits[0]);
        }
      });
    }
  }
})

;
