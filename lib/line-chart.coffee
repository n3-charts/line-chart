old_m = angular.module('n3-charts.linechart', ['n3charts.utils'])
m = angular.module('n3-line-chart', ['n3charts.utils'])

directive = (name, conf) ->
  old_m.directive(name, conf)
  m.directive(name, conf)

directive('linechart', ['n3utils', '$window', '$timeout', (n3utils, $window, $timeout) ->
  link  = (scope, element, attrs, ctrl) ->
    _u = n3utils
    dim = _u.getDefaultMargins()

    scope.updateDimensions = (dimensions) ->
      top = _u.getPixelCssProp(element[0].parentElement, 'padding-top')
      bottom = _u.getPixelCssProp(element[0].parentElement, 'padding-bottom')
      left = _u.getPixelCssProp(element[0].parentElement, 'padding-left')
      right = _u.getPixelCssProp(element[0].parentElement, 'padding-right')
      dimensions.width = (element[0].parentElement.offsetWidth || 900) - left - right
      dimensions.height = (element[0].parentElement.offsetHeight || 500) - top - bottom

    scope.update = ->
      scope.updateDimensions(dim)
      scope.redraw(dim)


    isUpdatingOptions = false
    initialHandlers =
      onSeriesVisibilityChange: ({series, index, newVisibility}) ->
        isUpdatingOptions = true
        scope.options.series[index].visible = newVisibility
        scope.$apply()
        isUpdatingOptions = false

    scope.redraw = (dimensions) ->
      options = _u.sanitizeOptions(scope.options, attrs.mode)
      handlers = angular.extend(initialHandlers, _u.getTooltipHandlers(options))
      dataPerSeries = _u.getDataPerSeries(scope.data, options)

      isThumbnail = attrs.mode is 'thumbnail'

      _u.clean(element[0])

      svg = _u.bootstrap(element[0], dimensions)
      axes = _u
        .createAxes(svg, dimensions, options.axes)
        .andAddThemIf(isThumbnail)

      if dataPerSeries.length
        _u.setScalesDomain(axes, scope.data, options.series, svg, options.axes)

      if isThumbnail
        _u.adjustMarginsForThumbnail(dimensions, axes)
      else
        _u.adjustMargins(dimensions, options, scope.data)

      _u.createContent(svg, handlers)

      if dataPerSeries.length
        columnWidth = _u.getBestColumnWidth(dimensions, dataPerSeries)

        _u
          .drawArea(svg, axes, dataPerSeries, options, handlers)
          .drawColumns(svg, axes, dataPerSeries, columnWidth, handlers)
          .drawLines(svg, axes, dataPerSeries, options, handlers)

        if options.drawDots
          _u.drawDots(svg, axes, dataPerSeries, options, handlers)

      if options.drawLegend
        _u.drawLegend(svg, options.series, dimensions, handlers)

      if options.tooltipMode is 'scrubber'
        _u.createGlass(svg, dimensions, handlers, axes, dataPerSeries)
      else if options.tooltipMode isnt 'none'
        _u.addTooltips(svg, dimensions, options.axes)




    promise = undefined
    window_resize = ->
      $timeout.cancel(promise) if promise?
      promise = $timeout(scope.update, 1)

    $window.addEventListener('resize', window_resize)

    scope.$watch('data', scope.update, true)
    scope.$watch('options', (v) ->
      return if isUpdatingOptions
      scope.update()
    , true)

  return {
    replace: true
    restrict: 'E'
    scope: {data: '=', options: '='}
    template: '<div></div>'
    link: link
  }
])
