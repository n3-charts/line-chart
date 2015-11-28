angular.module('markdownToJS', [])

.directive('markdown', function($http) {
  return {
    restrict: 'E',
    scope: {url: '@'},
    replace: true,
    link: function(scope, elm, attrs) {
      scope.$watch('url', function(url) {
        $http.get(url).then(function(response) {
          elm[0].innerHTML = marked(response.data);
        });
      });
    },
    template: '<div class="markdown-to-html"></div>'
  }
})
