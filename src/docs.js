angular.module('docs', ['markdown', 'info'])

.controller('DocsCtrl', function($scope, $sce, $http, version) {
  mixpanel.track('Docs', {version: 'v2'});

  version.get().then(function(latestTag) {
    $scope.url = "https://raw.githubusercontent.com/n3-charts/line-chart/" + latestTag + "/docs/usage.md";
  });
})
;
