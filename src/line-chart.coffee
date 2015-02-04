old_m = angular.module('n3-charts.linechart', ['n3charts.utils'])
m = angular.module('n3-line-chart', ['n3charts.utils'])

directive = (name, conf) ->
  old_m.directive(name, conf)
  m.directive(name, conf)

directive('linechart', ['n3utils', '$window', '$timeout', (n3utils, $window, $timeout) ->
  link  = (scope, element, attrs, ctrl) ->
    _u = n3utils
    dim = _u.getDefaultMargins()

    # Hacky hack so the chart doesn't grow in height when resizing...
    element[0].style['font-size'] = 0

    scope.updateDimensions = (dimensions) ->
      parent = element[0].parentElement

      top = _u.getPixelCssProp(parent, 'padding-top')
      bottom = _u.getPixelCssProp(parent, 'padding-bottom')
      left = _u.getPixelCssProp(parent, 'padding-left')
      right = _u.getPixelCssProp(parent, 'padding-right')

      dimensions.width = +(attrs.width || parent.offsetWidth || 900) - left - right
      dimensions.height = +(attrs.height || parent.offsetHeight || 500) - top - bottom

      return

    scope.redraw = ->
      scope.updateDimensions(dim)
      scope.update(dim)

      return

    isUpdatingOptions = false
    initialHandlers =
      onSeriesVisibilityChange: ({series, index, newVisibility}) ->
        scope.options.series[index].visible = newVisibility
        scope.$apply()

    scope.update = (dimensions) ->
      options = _u.sanitizeOptions(scope.options, attrs.mode)
      handlers = angular.extend(initialHandlers, _u.getTooltipHandlers(options))
      dataPerSeries = _u.getDataPerSeries(scope.data, options)

      isThumbnail = attrs.mode is 'thumbnail'

      _u.clean(element[0])

      svg = _u.bootstrap(element[0], dimensions)

      fn = (key) -> (options.series.filter (s) -> s.axis is key and s.visible isnt false).length > 0

      axes = _u
        .createAxes(svg, dimensions, options.axes)
        .andAddThemIf({
          all: !isThumbnail
          x: true
          y: fn('y')
          y2: fn('y2')
        })

      if dataPerSeries.length
        _u.setScalesDomain(axes, scope.data, options.series, svg, options)

      if isThumbnail
        _u.adjustMarginsForThumbnail(dimensions, axes)
      else
        _u.adjustMargins(dimensions, options)

      _u.createContent(svg, handlers)

      if dataPerSeries.length
        columnWidth = _u.getBestColumnWidth(dimensions, dataPerSeries, options)

        _u
          .drawArea(svg, axes, dataPerSeries, options, handlers)
          .drawColumns(svg, axes, dataPerSeries, columnWidth, options, handlers)
          .drawLines(svg, axes, dataPerSeries, options, handlers)

        if options.drawDots
          _u.drawDots(svg, axes, dataPerSeries, options, handlers)

      if options.drawLegend
        _u.drawLegend(svg, options.series, dimensions, handlers)

      if options.tooltip.mode is 'scrubber'
        _u.createGlass(svg, dimensions, handlers, axes, dataPerSeries, options, columnWidth)
      else if options.tooltip.mode isnt 'none'
        _u.addTooltips(svg, dimensions, options.axes)


    promise = undefined
    window_resize = ->
      $timeout.cancel(promise) if promise?
      promise = $timeout(scope.redraw, 1)

    $window.addEventListener('resize', window_resize)

    scope.$watch('data', scope.redraw, true)
    scope.$watch('options', (-> scope.update(dim)) , true)

  return {
    replace: true
    restrict: 'E'
    scope: {data: '=', options: '='}
    template: '<div></div>'
    link: link
  }
])
