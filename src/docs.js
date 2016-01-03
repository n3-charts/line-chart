angular.module('docs', ['markdown'])

.controller('DocsCtrl', function($scope, $sce, $http) {
  mixpanel.track('Docs', {version: 'v2'});

})
;
