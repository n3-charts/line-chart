angular.module('tests', [])


.controller('TestsCtrl', function($scope, appUtils) {
  // mixpanel.track("Tests");

  d3.json('../data/tests.json', function(error, result) {
    $scope.tests = result.results;
    $scope.$apply();
  });
});
