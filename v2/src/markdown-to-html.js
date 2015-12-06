angular.module('markdown', [])


.directive('highlightJs', function($interpolate) {
  return {
    restrict: 'A',
    compile: function(elm, attrs) {
      var interpolateFn = $interpolate(elm.html(), true);
      elm.html(''); // stop automatic intepolation

      return function(scope, elem, attrs){
        scope.$watch(interpolateFn, function (value) {
          elem.html(hljs.highlightAuto(value).value);
        });
      }
      // console.log(elm);
      // hljs.highlightBlock(elm[0]);
    }
  }
})

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
