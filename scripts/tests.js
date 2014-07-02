angular.module('tests', [])


.filter('firstUp', function() {
  return function(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
  };
})

.filter('round', function() {
  return function(value) {
    return value ? parseInt(value, 10) : '';
  };
})

.controller('TestsCtrl', function($scope, appUtils) {
  mixpanel.track("Tests");

  $scope.getTestClass = function(test) {
    switch (test.status) {
      case 'success':
        return 'fa-check good'

      case 'warning':
        return 'fa-question not-sure'

      case 'error':
        return 'fa-times bad'
    }
  };

  d3.json('data/test_results.json', function(error, result) {
    $scope.tests = result.results;
    b = $scope.build = result.build;

    if (b.is_a_pull_request !== "false") {
      $scope.description = "Build triggered by pull request #" + b.is_a_pull_request + " (for merge into " + b.branch + ")";
      $scope.link = "https://github.com/n3-charts/line-chart/pull/" + b.is_a_pull_request;
    } else {
      $scope.description = "Build triggered by a push on branch " + b.branch;
      $scope.link = "https://github.com/n3-charts/line-chart/tree/" + b.branch;
    }

    $scope.$apply();
  });

  $scope.expand = function(test, event) {
    if (event.altKey) {
      $scope.tests.forEach(function(t) {
        t.expanded = true;
      });
    } else {
      test.expanded = true;
    }
  };

  $scope.collapse = function(test, event) {
    if (event.altKey) {
      $scope.tests.forEach(function(t) {
        t.expanded = false;
      });
    } else {
      test.expanded = false;
    }
  };
});
