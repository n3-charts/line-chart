angular.module('n3-charts.linechart', ['n3charts.utils'])

.directive('linechart', ['n3utils', '$window', '$timeout', (n3utils, $window, $timeout) ->
  link  = (scope, element, attrs, ctrl) ->
    dim = n3utils.getDefaultMargins()

    scope.updateDimensions = (dimensions) ->
      top = n3utils.getPixelCssProp(element[0].parentElement, 'padding-top')
      bottom = n3utils.getPixelCssProp(element[0].parentElement, 'padding-bottom')
      left = n3utils.getPixelCssProp(element[0].parentElement, 'padding-left')
      right = n3utils.getPixelCssProp(element[0].parentElement, 'padding-right')
      dimensions.width = (element[0].parentElement.offsetWidth || 900) - left - right
      dimensions.height = (element[0].parentElement.offsetHeight || 500) - top - bottom

    scope.update = ->
      scope.updateDimensions(dim)
      scope.redraw(dim)

    scope.redraw = (dimensions) ->
      options = n3utils.sanitizeOptions(scope.options)
      data = scope.data
      series = options.series
      dataPerSeries = n3utils.getDataPerSeries(data, options)
      isThumbnail = attrs.mode is 'thumbnail'

      n3utils.clean(element[0])

      svg = n3utils.bootstrap(element[0], dimensions)
      axes = n3utils
        .createAxes(svg, dimensions, options.axes)
        .andAddThemIf(isThumbnail)

      if dataPerSeries.length
        n3utils.setScalesDomain(axes, data, options.series, svg, options.axes)

      if isThumbnail
        n3utils.adjustMarginsForThumbnail(dimensions, axes)
      else
        n3utils.adjustMargins(dimensions, options, data)

      n3utils.createContent(svg)

      n3utils.drawLegend(svg, series, dimensions) unless isThumbnail

      if dataPerSeries.length
        columnWidth = n3utils.getBestColumnWidth(dimensions, dataPerSeries)

        n3utils
          .drawArea(svg, axes, dataPerSeries, options)
          .drawColumns(svg, axes, dataPerSeries, columnWidth)
          .drawLines(svg, axes, dataPerSeries, options)

        n3utils.drawDots(svg, axes, dataPerSeries) unless isThumbnail

      n3utils.addTooltips(svg, dimensions, options.axes) unless isThumbnail

    timeoutPromise = undefined
    window_resize = ->
      $timeout.cancel(timeoutPromise)
      timeoutPromise = $timeout(scope.update, 1)

    $window.addEventListener('resize', window_resize)

    scope.$watch('data', scope.update)
    scope.$watch('options', scope.update, true)

  return {
    replace: true
    restrict: 'E'
    scope: {data: '=', options: '='}
    template: '<div></div>'
    link: link
  }
])
