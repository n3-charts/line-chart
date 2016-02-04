angular.module('migration', ['markdown', 'info'])

.controller('MigrationCtrl', function($scope, $sce, $http, version) {
  mixpanel.track('Migration', {version: 'v2'});

  version.get().then(function(latestTag) {
    $scope.url = "https://raw.githubusercontent.com/n3-charts/line-chart/" + latestTag + "/docs/migration.md";
  });
})
;
