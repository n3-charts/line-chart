angular.module('markdown', [])

.directive('markdownToHtml', function($http) {
  return {
    restrict: 'E',
    scope: {url: '@'},
    replace: true,
    link: function(scope, elm, attrs) {
      var renderer = new marked.Renderer();

      renderer.codespan = function(code, language) {
        return '<code class="inline">' + code + '</code>';
      };

      marked.setOptions({
        highlight: function (code) {
          return hljs.highlightAuto(code).value;
        }
      });

      scope.$watch('url', function(url) {
        $http.get(url).then(function(response) {
          elm[0].innerHTML = marked(response.data, {renderer: renderer});
        });
      });
    },
    template: '<div class="markdown-to-html"></div>'
  }
})
