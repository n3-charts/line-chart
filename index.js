angular.module('v2App', ['n3-line-chart', 'apojop', 'ui.router', 'home', 'docs', 'migration', 'examples'])

.config(['$stateProvider', '$urlRouterProvider', function config($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('home');

  $stateProvider
    .state('home', {
      url: '/home',
      controller: 'HomeCtrl',
      templateUrl: 'src/home.html'
    })
    .state('docs', {
      url: '/docs',
      controller: 'DocsCtrl',
      templateUrl: 'src/docs.html'
    })
    .state('migration', {
      url: '/migration',
      controller: 'MigrationCtrl',
      templateUrl: 'src/migration.html'
    })
    .state('examples', {
      url: '/examples',
      controller: 'ExamplesCtrl',
      templateUrl: 'src/examples.html'
    })
    ;
}])

.run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
}])

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
