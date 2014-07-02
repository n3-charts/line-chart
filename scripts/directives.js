angular.module('directives', [])

.directive('dragParent', ['$document', function($document) {
  return function(scope, element, attr) {
    var startX = 0, startY = 0, x = 0, y = 0;

    var rect = element[0].parentNode.getBoundingClientRect()
    x = rect.left;
    y = rect.top;

    element.on('mousedown', function(event) {
      // Prevent default dragging of selected content
      event.preventDefault();
      startX = event.pageX - x;
      startY = event.pageY - y;

      $document.on('mousemove', mousemove);
      $document.on('mouseup', mouseup);
    });

    function mousemove(event) {
      y = event.pageY - startY;
      x = event.pageX - startX;
      angular.element(element[0].parentNode).css({
        top: y + 'px',
        left:  x + 'px'
      });
    }

    function mouseup() {
      $document.off('mousemove', mousemove);
      $document.off('mouseup', mouseup);
    }
  };
}])

.directive('chartOptionsEditor', function() {
  return {
    templateUrl: "templates/options.html",
    restrict: 'E',
    replace: true,
    scope: {options: '=', data: '='},
    link: function(scope, element, attrs) {
      scope.fields = []

      scope.$watch('data', function(v){
        if (!v) {
          return;
        }

        scope.fields = [];

        for (key in v[0]) {
          scope.fields.push(key);
        }
      });


      scope.interpolationModes = [
        "linear",
        "step-before",
        "step-after",
        "basis",
        "basis-open",
        "basis-closed",
        "bundle",
        "cardinal",
        "cardinal-open",
        "cadinal-closed",
        "monotone"
      ];

      scope.tooltipModes = ["none", "axes", "scrubber"];
      scope.fields = ["x", "val_0", "val_1", "val_2", "val_3"];

      scope.addSeries = function() {
        scope.options.series.unshift({y: scope.fields[scope.fields.length - 1]});
      };

      scope.removeSeries = function(series) {
        scope.options.series.splice(scope.options.series.indexOf(series), 1);
      };
    }
  }
})

.directive('series', function() {
  return {
    templateUrl: "templates/series.html",
    restrict: 'E',
    replace: true,
    scope: {series: '=', fields: '=', remove: '&'},
    link: function(scope, element, attrs) {
      scope.types = ["line", "area", "column"];
      scope.axes = ["y", "y2"];

      scope.thickness = 1

      scope.$watch('series', function(v) {
        if (!v || !v.thickness) {
          return;
        }

        scope.thickness = +v.thickness.replace('px', '');
      }, true);

      scope.$watch('thickness', function(v) {
        scope.series.thickness = v + 'px';
      });
    }
  }
})

.directive('axis', function() {
  return {
    templateUrl: "templates/axis.html",
    restrict: 'E',
    replace: true,
    scope: {axis: '=', key: '=', fields: '='},
    link: function(scope, element, attrs) {
      scope.xTypes = ['linear', 'date'];
      scope.yTypes = ['linear', 'log'];
    }
  }
})
