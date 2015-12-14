angular.module('codepen', ['apojop'])

.directive('codepenButton', function(prettils) {
  return {
    restrict: 'E',
    link: function(scope, element, attrs) {
      scope.$watchCollection(
        '[' + [attrs.codepenData, attrs.codepenOptions, attrs.codepenName].join() + ']',
        function(values) {
          var data = values[0];
          var options = values[1];
          var name = values[2];

          if (!data || !options || !name) {
            return;
          }

          scope.track = function() {
            mixpanel.track("codepen", {title: name, version: 'v2'});
          };

          var postDeserializing = "";

          if (options.axes && options.axes.x.type === 'date') {
            postDeserializing = "$scope.data.forEach(function(row) {" +
            "\n    row.x = new Date(row.x);" +
            "\n  });";
          }

          var HTML = '<div class="container" ng-app="example" ng-controller="ExampleCtrl">' +
            '\n  <linechart data="data" options="options"></linechart>' +
            '\n</div>';


          var JS = "angular.module('example', ['n3-line-chart'])" +
          "\n.controller('ExampleCtrl', function($scope) {" +
          "\n // Due to CodePen's API, it's not possible to include functions in dynamic CodePen's such as this one," +
          " therefore some closures might be missing (the axes' formatting functions, for example) and need to be added manually. Thanks ! :-)" +
          "\n  $scope.data = " + JSON.stringify(data, null, 2).replace('\n', '\n  ').replace(/"([^"]+)":/g, '$1:') + ";" +
          "\n\n  $scope.options = " + JSON.stringify(options, null, 2).replace(/"([^"]+)":/g, '$1:') + ";" +
          "\n  " + postDeserializing +
          "\n});";

          var JS_EXTERNAL = [
            'http://ajax.googleapis.com/ajax/libs/angularjs/1.4.3/angular.min.js',
            'http://ajax.googleapis.com/ajax/libs/angularjs/1.4.3/angular-route.min.js',
            'http://d3js.org/d3.v3.min.js',
            'http://codepen.io/n3-charts/pen/KdjqgW.js'
          ].join(';');

          var CSS = ".container {\n  width: 600px;\n  height: 300px;\n}";

          var CSS_EXTERNAL = [
            'http://codepen.io/n3-charts/pen/KdjqgW.css'
          ].join(';');

          var data = {
            title: 'n3-charts: ' + name.toLowerCase(),
            html: HTML,
            css: CSS,
            js: JS,
            js_external: JS_EXTERNAL,
            css_external: CSS_EXTERNAL
          };

        scope.jsonPayload = JSON.stringify(data, null, 2)
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");
        }
      );
    },
    replace: true,
    template: '<form class="codepen-form" action="http://codepen.io/pen/define" method="POST" target="_blank">' +
      '<input type="hidden" name="data" value="{{jsonPayload}}">' +
      '<button ng-click="track()" class="codepen-button"><i class="fa fa-codepen"></i> Open in CodePen</button>' +
    '</form>'
  }
})
