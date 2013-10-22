angular.module('n3-charts.linechart', ['n3charts.utils'])

.directive('linechart', ['n3utils', '$window', '$timeout', function(n3utils, $window, $timeout) {
  var link  = function(scope, element, attrs, ctrl) {
    var dim = n3utils.getDefaultMargins();

    scope.updateDimensions = function(dimensions) {
      var top = n3utils.getPixelCssProp(element[0].parentElement, 'padding-top');
      var bottom = n3utils.getPixelCssProp(element[0].parentElement, 'padding-bottom');
      var left = n3utils.getPixelCssProp(element[0].parentElement, 'padding-left');
      var right = n3utils.getPixelCssProp(element[0].parentElement, 'padding-right');
      dimensions.width = (element[0].parentElement.offsetWidth || 900) - left - right;
      dimensions.height = (element[0].parentElement.offsetHeight || 500) - top - bottom;
    };

    scope.update = function() {
      scope.updateDimensions(dim);
      scope.redraw(dim);
    };

    scope.redraw = function(dimensions) {
      var options = n3utils.sanitizeOptions(scope.options);
      var data = scope.data;
      var series = options.series;
      var dataPerSeries = n3utils.getDataPerSeries(data, options);
      var isThumbnail = (attrs.mode === 'thumbnail');

      n3utils.clean(element[0]);

      var svg = n3utils.bootstrap(element[0], dimensions);
      var axes = n3utils
        .createAxes(svg, dimensions, options.axes)
        .andAddThemIf(isThumbnail);

      if (dataPerSeries.length > 0) {
        n3utils.setScalesDomain(axes, data, options.series, svg, options.axes);
      }

      if (isThumbnail) {
        n3utils.adjustMarginsForThumbnail(dimensions, axes);
      } else {
        n3utils.adjustMargins(dimensions, options, data);
      }

      n3utils.createContent(svg);
      n3utils.createClippingPath(svg, dimensions);

      if (!isThumbnail) {
        n3utils.drawLegend(svg, series, dimensions);
      }

      var lineMode = options.lineMode;

      if (dataPerSeries.length > 0) {

        var columnWidth = n3utils.getBestColumnWidth(dimensions, dataPerSeries);

        n3utils
          .drawArea(svg, axes, dataPerSeries, lineMode)
          .drawColumns(svg, axes, dataPerSeries, columnWidth)
          .drawLines(svg, axes, dataPerSeries, lineMode)
          .drawDots(svg, axes, dataPerSeries)
        ;
      }

      if (!isThumbnail) {
        n3utils.addTooltips(svg, dimensions, options.axes);
      }
    };

    var timeoutPromise;
    var window_resize = function(e) {
      $timeout.cancel(timeoutPromise);
      timeoutPromise = $timeout(scope.update, 1);
    };

    $window.addEventListener('resize', window_resize);

    scope.$watch('data', scope.update);
    scope.$watch('options', scope.update, true);
  };

  return {
    replace: true,
    restrict: 'E',
    scope: {data: '=', options: '='},
    template: '<div></div>',
    link: link
  };
}]);
