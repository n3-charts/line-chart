old_m = angular.module('n3-charts.linechart', ['n3charts.utils'])
m = angular.module('n3-line-chart', ['n3charts.utils'])

directive = (name, conf) ->
  old_m.directive(name, conf)
  m.directive(name, conf)

directive('linechart', ['n3utils', '$window', '$timeout', (n3utils, $window, $timeout) ->
  link  = (scope, element, attrs, ctrl) ->
    _u = n3utils
    dispatch = _u.getEventDispatcher()
    id = _u.uuid()

    # Hacky hack so the chart doesn't grow in height when resizing...
    element[0].style['font-size'] = 0

    scope.redraw = ->
      scope.update()

      return

    isUpdatingOptions = false
    initialHandlers =
      onSeriesVisibilityChange: ({series, index, newVisibility}) ->
        scope.options.series[index].visible = newVisibility
        scope.$apply()

    scope.update = () ->
      options = _u.sanitizeOptions(scope.options, attrs.mode)
      handlers = angular.extend(initialHandlers, _u.getTooltipHandlers(options))
      dataPerSeries = _u.getDataPerSeries(scope.data, options)
      dimensions = _u.getDimensions(options, element, attrs)
      isThumbnail = attrs.mode is 'thumbnail'

      _u.clean(element[0])

      svg = _u.bootstrap(element[0], id, dimensions)

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

      _u.createContent(svg, id, options, handlers)

      if dataPerSeries.length
        columnWidth = _u.getBestColumnWidth(axes, dimensions, dataPerSeries, options)
        _u.drawData(svg, dimensions, axes, dataPerSeries, columnWidth, options, handlers, dispatch)

      if options.drawLegend
        _u.drawLegend(svg, options.series, dimensions, handlers, dispatch)

      if options.tooltip.mode is 'scrubber'
        _u.createGlass(svg, dimensions, handlers, axes, dataPerSeries, options, dispatch, columnWidth)
      else if options.tooltip.mode isnt 'none'
        _u.addTooltips(svg, dimensions, options.axes)

      _u.createFocus(svg, dimensions, options)
      _u.setZoom(svg, dimensions, axes, dataPerSeries, columnWidth, options, handlers, dispatch)

    updateEvents = ->

      # Deprecated: this will be removed in 2.x
      if scope.oldclick
        dispatch.on('click', scope.oldclick)
      else if scope.click
        dispatch.on('click', scope.click)
      else
        dispatch.on('click', null)

      # Deprecated: this will be removed in 2.x
      if scope.oldhover
        dispatch.on('hover', scope.oldhover)
      else if scope.hover
        dispatch.on('hover', scope.hover)
      else
        dispatch.on('hover', null)

      if scope.mouseenter
        dispatch.on('mouseenter', scope.mouseenter)
      else
        dispatch.on('mouseenter', null)

      if scope.mouseover
        dispatch.on('mouseover', scope.mouseover)
      else
        dispatch.on('mouseover', null)

      if scope.mouseout
        dispatch.on('mouseout', scope.mouseout)
      else
        dispatch.on('mouseout', null)

      # Deprecated: this will be removed in 2.x
      if scope.oldfocus
        dispatch.on('focus', scope.oldfocus)
      else if scope.focus
        dispatch.on('focus', scope.focus)
      else
        dispatch.on('focus', null)

      if scope.toggle
        dispatch.on('toggle', scope.toggle)
      else
        dispatch.on('toggle', null)

    promise = undefined
    window_resize = ->
      $timeout.cancel(promise) if promise?
      promise = $timeout(scope.redraw, 1)

    $window.addEventListener('resize', window_resize)

    scope.$watch('data', scope.redraw, true)
    scope.$watch('options', scope.redraw , true)
    scope.$watchCollection('[click, hover, focus, toggle]', updateEvents)
    scope.$watchCollection('[mouseenter, mouseover, mouseout]', updateEvents)

    # Deprecated: this will be removed in 2.x
    scope.$watchCollection('[oldclick, oldhover, oldfocus]', updateEvents)

    # Clean up the listeners when directive is destroyed
    scope.$on('$destroy', () ->
      $window.removeEventListener('resize', window_resize)
    )

    return

  return {
    replace: true
    restrict: 'E'
    scope:
      data: '=', options: '=',
      # Deprecated: this will be removed in 2.x
      oldclick: '=click',  oldhover: '=hover',  oldfocus: '=focus',
      # Events
      click: '=onClick',  hover: '=onHover',  focus: '=onFocus',  toggle: '=onToggle',
      mouseenter: '=onMouseenter',  mouseover: '=onMouseover',  mouseout: '=onMouseout'
    template: '<div></div>'
    link: link
  }
])
