angular.module('tests', [])


.filter('firstUp', function() {
  return function(value) {
    if (!value) {
      return ''
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
  };
})

.filter('round', function() {
  return function(value) {
    if (!value) {
      return ''
    }

    return parseInt(value, 10);
  };
})

.controller('TestsCtrl', function($scope, appUtils) {
  mixpanel.track("Tests");
  d3.json('../data/test_results.json', function(error, result) {
    $scope.tests = result.results;
    $scope.$apply();
  });
});
