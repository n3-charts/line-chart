###
line-chart - v1.1.12 - 12 September 2015
https://github.com/n3-charts/line-chart
Copyright (c) 2015 n3-charts
###
# src/line-chart.coffee
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

# ----

# /tmp/utils.coffee
mod = angular.module('n3charts.utils', [])

mod.factory('n3utils', ['$window', '$log', '$rootScope', ($window, $log, $rootScope) ->
  return {
# src/utils/areas.coffee
      addPatterns: (svg, series) ->
        pattern = svg.select('defs').selectAll('pattern')
        .data(series.filter (s) -> s.striped)
        .enter().append('pattern')
          .attr(
            id: (s) -> s.type + 'Pattern_' + s.index
            patternUnits: "userSpaceOnUse"
            x: 0
            y: 0
            width: 60
            height: 60
          ).append('g')
            .style(
              'fill': (s) -> s.color
              'fill-opacity': 0.3
            )

        pattern.append('rect')
          .style('fill-opacity', 0.3)
          .attr('width', 60)
          .attr('height', 60)

        pattern.append('path')
          .attr('d', "M 10 0 l10 0 l -20 20 l 0 -10 z")

        pattern.append('path')
          .attr('d', "M40 0 l10 0 l-50 50 l0 -10 z")

        pattern.append('path')
          .attr('d', "M60 10 l0 10 l-40 40 l-10 0 z")

        pattern.append('path')
          .attr('d', "M60 40 l0 10 l-10 10 l -10 0 z")

      drawArea: (svg, scales, data, options) ->
        areaSeries = data.filter (series) -> series.type is 'area'

        this.addPatterns(svg, areaSeries)

        drawers =
          y: this.createLeftAreaDrawer(scales, options.lineMode, options.tension)
          y2: this.createRightAreaDrawer(scales, options.lineMode, options.tension)

        areaJoin = svg.select('.content').selectAll('.areaGroup')
          .data(areaSeries)

        areaGroup = areaJoin.enter()
          .append('g')
          .attr('class', (s) -> 'areaGroup ' + 'series_' + s.index)
        
        areaJoin.each (series) ->
          dataJoin = d3.select(this).selectAll('path')
            .data([series])

          dataJoin.enter().append('path')
            .attr('class', 'area')
          
          dataJoin.style('fill', (s) ->
              return s.color if s.striped isnt true
              return "url(#areaPattern_#{s.index})"
            )
            .style('opacity', (s) -> if s.striped then '1' else '0.3')
            .attr('d', (d) -> drawers[d.axis](d.values))

        return this

      createLeftAreaDrawer: (scales, mode, tension) ->
        return d3.svg.area()
          .x (d) -> return scales.xScale(d.x)
          .y0 (d) -> return scales.yScale(d.y0)
          .y1 (d) -> return scales.yScale(d.y0 + d.y)
          .interpolate(mode)
          .tension(tension)

      createRightAreaDrawer: (scales, mode, tension) ->
        return d3.svg.area()
          .x (d) -> return scales.xScale(d.x)
          .y0 (d) -> return scales.y2Scale(d.y0)
          .y1 (d) -> return scales.y2Scale(d.y0 + d.y)
          .interpolate(mode)
          .tension(tension)

# ----


# src/utils/columns.coffee
      getPseudoColumns: (data, options) ->
        data = data.filter (s) -> s.type is 'column'

        pseudoColumns = {}
        keys = []
        data.forEach (series) ->
          i = options.series.map((d) -> d.id).indexOf(series.id)
          visible = options.series?[i].visible
          if visible is undefined or visible is not false
            inAStack = false
            options.stacks.forEach (stack, index) ->
              if series.id? and series.id in stack.series
                pseudoColumns[series.id] = index
                keys.push(index) unless index in keys
                inAStack = true

            if inAStack is false
              i = pseudoColumns[series.id] = index = keys.length
              keys.push(i)

        return {pseudoColumns, keys}

      getMinDelta: (seriesData, key, scale, range) ->
        return d3.min(
          # Compute the minimum difference along an axis on all series
          seriesData.map (series) ->
            # Compute delta
            return series.values
              # Look at all scaled values on the axis
              .map((d) -> scale(d[key]))
              # Select only columns in the visible range
              .filter((e) ->
                return if range then e >= range[0] && e <= range[1] else true
              )
              # Return the smallest difference between 2 values
              .reduce((prev, cur, i, arr) ->
                # Get the difference from the current value
                # with the previous value in the array
                diff = if i > 0 then Math.max(cur - arr[i - 1], 0) else Number.MAX_VALUE
                # Return the new difference if it is smaller
                # than the previous difference
                return if diff < prev then diff else prev
              , Number.MAX_VALUE)
        )

      getBestColumnWidth: (axes, dimensions, seriesData, options) ->
        return 10 unless seriesData and seriesData.length isnt 0

        return 10 if (seriesData.filter (s) -> s.type is 'column').length is 0

        {pseudoColumns, keys} = this.getPseudoColumns(seriesData, options)

        # inner width of the chart area
        innerWidth = dimensions.width - dimensions.left - dimensions.right

        colData = seriesData
          # Get column data (= columns that are not stacked)
          .filter((d) ->
            return pseudoColumns.hasOwnProperty(d.id)
          )

        # Get the smallest difference on the x axis in the visible range
        delta = this.getMinDelta(colData, 'x', axes.xScale, [0, innerWidth])
        
        # We get a big value when we cannot compute the difference
        if delta > innerWidth
          # Set to some good looking ordinary value
          delta = 0.25 * innerWidth

        # number of series to display
        nSeries = keys.length

        return if options.columnsHGap < delta \
          then Math.max(1.0, (delta - options.columnsHGap) / nSeries) \
          else Math.max(1.0, delta*0.8 / nSeries)

      getColumnAxis: (data, columnWidth, options) ->
        {pseudoColumns, keys} = this.getPseudoColumns(data, options)

        x1 = d3.scale.ordinal()
          .domain(keys)
          .rangeBands([0, keys.length * columnWidth], 0)

        return (s) ->
          return 0 unless pseudoColumns[s.id]?
          index = pseudoColumns[s.id]
          return x1(index) - keys.length*columnWidth/2

      drawColumns: (svg, axes, data, columnWidth, options, handlers, dispatch) ->

        # filter the data to retrieve only series of type column
        data = data.filter (s) -> s.type is 'column'

        x1 = this.getColumnAxis(data, columnWidth, options)

        data.forEach (s) -> s.xOffset = x1(s) + columnWidth*.5

        colJoin = svg.select('.content').selectAll('.columnGroup')
          .data(data)

        colGroup = colJoin.enter().append("g")
            .attr('class', (s) -> 'columnGroup series_' + s.index)
        
        colJoin.attr('transform', (s) -> "translate(" + x1(s) + ",0)")

        colJoin.each (series) ->
          # only draw visible series to avoid with="NaN" errors
          i = options.series.map((d) -> d.id).indexOf(series.id)
          visible = options.series?[i].visible
          if visible is undefined or visible is not false
            dataJoin = d3.select(this).selectAll("rect")
              .data(series.values)
            
            dataJoin.enter()
              .append("rect")
              .on('click': (d, i) -> dispatch.click(d, i, series))
              .on('mouseenter', (d, i) -> dispatch.mouseenter(d, i, series))
              .on('mouseover', (d, i) ->
                handlers.onMouseOver?(svg, {
                  series: series
                  x: axes.xScale(d.x)
                  y: axes[d.axis + 'Scale'](d.y0 + d.y)
                  datum: d
                }, options.axes)
                dispatch.hover(d, i, series)
                dispatch.mouseover(d, i, series)
              )
              .on('mouseout', (d, i) ->
                handlers.onMouseOut?(svg)
                dispatch.mouseout(d, i, series)
              )

            dataJoin.style({
                  'stroke': series.color
                  'fill': series.color
                  'stroke-opacity': (d) -> if d.y is 0 then '0' else '1'
                  'stroke-width': '1px'
                  'fill-opacity': (d) -> if d.y is 0 then 0 else 0.7
                })
                .attr(
                  width: columnWidth
                  x: (d) -> axes.xScale(d.x)
                  height: (d) ->
                    return axes[d.axis + 'Scale'].range()[0] if d.y is 0
                    return Math.abs(axes[d.axis + 'Scale'](d.y0 + d.y) - axes[d.axis + 'Scale'](d.y0))
                  y: (d) ->
                    if d.y is 0 then 0 else axes[d.axis + 'Scale'](Math.max(0, d.y0 + d.y))
                )

        return this
# ----


# src/utils/dots.coffee
      drawDots: (svg, axes, data, options, handlers, dispatch) ->
        dotJoin = svg.select('.content').selectAll('.dotGroup')
          .data(data.filter (s) -> s.type in ['line', 'area'] and s.drawDots)
        
        dotGroup = dotJoin.enter()
          .append('g')
          .attr('class', (s) -> "dotGroup series_#{s.index}")
        
        dotJoin.attr('fill', (s) -> s.color)

        dotJoin.each (series) ->

          dataJoin = d3.select(this).selectAll('.dot')
            .data(series.values)

          dataJoin.enter().append('circle')
            .attr('class', 'dot')
            .on('click': (d, i) -> dispatch.click(d, i, series))
            .on('mouseenter': (d, i) -> dispatch.mouseenter(d, i, series))
            .on('mouseover': (d, i) ->
              dispatch.hover(d, i, series)
              dispatch.mouseover(d, i, series)
            )
            .on('mouseout': (d, i) -> dispatch.mouseout(d, i, series))
          
          dataJoin.attr(
              'r': (d) -> d.dotSize
              'cx': (d) -> axes.xScale(d.x)
              'cy': (d) -> axes[d.axis + 'Scale'](d.y + d.y0)
            )
            .style(
              'stroke': 'white'
              'stroke-width': '2px'
            )

        if options.tooltip.mode isnt 'none'
          dotGroup.on('mouseover', (series) ->
            target = d3.select(d3.event.target)
            d = target.datum()
            target.attr('r', (s) -> s.dotSize + 2)

            handlers.onMouseOver?(svg, {
              series: series
              x: target.attr('cx')
              y: target.attr('cy')
              datum: d
            }, options.axes)
          )
          .on('mouseout', (d) ->
            d3.select(d3.event.target).attr('r', (s) -> s.dotSize)
            handlers.onMouseOut?(svg)
          )

        return this

# ----


# src/utils/events.coffee
      getEventDispatcher: () ->

        events = [
          'focus',
          'hover',
          'mouseenter',
          'mouseover',
          'mouseout',
          'click',
          'toggle'
        ]

        return d3.dispatch.apply(this, events)

      resetZoom: (svg, dimensions, axes, data, columnWidth, options, handlers, dispatch, zoom) ->
        zoom.scale(1)
        zoom.translate([0, 0])

        this.getZoomHandler(svg, dimensions, axes, data, columnWidth, options, handlers, dispatch, false)()

      getZoomHandler: (svg, dimensions, axes, data, columnWidth, options, handlers, dispatch, zoom) ->
        self = this

        return ->
          zoomed = false

          [ 'x', 'y', 'y2' ].forEach (axis) ->
            if options.axes[axis]?.zoomable?
              svg.selectAll(".#{axis}.axis").call(axes["#{axis}Axis"])
              zoomed = true

          if data.length
            columnWidth = self.getBestColumnWidth(axes, dimensions, data, options)
            self.drawData(svg, dimensions, axes, data, columnWidth, options, handlers, dispatch)

          if zoom and zoomed
            self.createZoomResetIcon(svg, dimensions, axes, data, columnWidth, options, handlers, dispatch, zoom)

      setZoom: (svg, dimensions, axes, data, columnWidth, options, handlers, dispatch) ->
        zoom = this.getZoomListener(axes, options)

        if zoom
          zoom.on("zoom", this.getZoomHandler(svg, dimensions, axes, data, columnWidth, options, handlers, dispatch, zoom))
          svg.call(zoom)

      getZoomListener: (axes, options) ->
        zoomable = false
        zoom = d3.behavior.zoom()

        [ 'x', 'y', 'y2' ].forEach (axis) ->
          if options.axes[axis]?.zoomable
            zoom[axis](axes["#{axis}Scale"])
            zoomable = true

        return if zoomable then zoom else false

# ----


# src/utils/legend.coffee
      computeLegendLayout: (svg, series, dimensions) ->
        padding = 10
        that = this

        leftWidths = this.getLegendItemsWidths(svg, 'y')

        leftLayout = [0]
        i = 1
        while i < leftWidths.length
          leftLayout.push(leftWidths[i-1] + leftLayout[i - 1] + padding)
          i++


        rightWidths = this.getLegendItemsWidths(svg, 'y2')
        return [leftLayout] unless rightWidths.length > 0

        w = dimensions.width - dimensions.right - dimensions.left

        cumul = 0
        rightLayout = []
        j = rightWidths.length - 1
        while j >= 0
          rightLayout.push w  - cumul - rightWidths[j]
          cumul += rightWidths[j] + padding
          j--

        rightLayout.reverse()

        return [leftLayout, rightLayout]

      getLegendItemsWidths: (svg, axis) ->
        that = this
        bbox = (t) -> that.getTextBBox(t).width

        items = svg.selectAll(".legendItem.#{axis}")
        return [] unless items.length > 0

        widths = []
        i = 0
        while i < items[0].length
          widths.push(bbox(items[0][i]))
          i++

        return widths

      drawLegend: (svg, series, dimensions, handlers, dispatch) ->
        that = this
        legend = svg.append('g').attr('class', 'legend')

        d = 16

        svg.select('defs').append('svg:clipPath')
          .attr('id', 'legend-clip')
          .append('circle').attr('r', d/2)

        groups = legend.selectAll('.legendItem')
          .data(series)

        groups.enter().append('g')
          .on('click', (s, i) ->
            visibility = !(s.visible isnt false)
            dispatch.toggle(s, i, visibility)
            handlers.onSeriesVisibilityChange?({
              series: s,
              index: i,
              newVisibility: visibility
            })
          )
        
        groups.attr(
              'class': (s, i) -> "legendItem series_#{i} #{s.axis}"
              'opacity': (s, i) ->
                if s.visible is false
                  that.toggleSeries(svg, i)
                  return '0.2'

                return '1'
            )
          .each (s) ->
            item = d3.select(this)
            item.append('circle')
              .attr(
                'fill': s.color
                'stroke': s.color
                'stroke-width': '2px'
                'r': d/2
              )

            item.append('path')
              .attr(
                'clip-path': 'url(#legend-clip)'
                'fill-opacity': if s.type in ['area', 'column'] then '1' else '0'
                'fill': 'white'
                'stroke': 'white'
                'stroke-width': '2px'
                'd': that.getLegendItemPath(s, d, d)
              )

            item.append('circle')
              .attr(
                'fill-opacity': 0
                'stroke': s.color
                'stroke-width': '2px'
                'r': d/2
              )

            item.append('text')
              .attr(
                'class': (d, i) -> "legendText series_#{i}"
                'font-family': 'Courier'
                'font-size': 10
                'transform': 'translate(13, 4)'
                'text-rendering': 'geometric-precision'
              )
              .text(s.label || s.y)

        # Translate every legend g node to its position
        translateLegends = () ->
          [left, right] = that.computeLegendLayout(svg, series, dimensions)
          groups
            .attr(
              'transform': (s, i) ->
                if s.axis is 'y'
                  return "translate(#{left.shift()},#{dimensions.height-40})"
                else
                  return "translate(#{right.shift()},#{dimensions.height-40})"
            )

        # We need to call this once, so the
        # legend text does not blink on every update
        translateLegends()

        # now once again,
        # to make sure, text width gets really! computed properly
        setTimeout(translateLegends, 0)

        return this

      getLegendItemPath: (series, w, h) ->
        if series.type is 'column'
          path = 'M' + (-w/3) + ' ' + (-h/8) + ' l0 ' + h + ' '
          path += 'M0' + ' ' + (-h/3) + ' l0 ' + h + ' '
          path += 'M' + w/3 + ' ' + (-h/10) + ' l0 ' + h + ' '

          return path

        base_path = 'M-' + w/2 + ' 0' + h/3 + ' l' + w/3 + ' -' + h/3 + ' l' + w/3 + ' ' +  h/3 + ' l' + w/3 + ' -' + 2*h/3

        base_path + ' l0 ' + h + ' l-' + w + ' 0z' if series.type is 'area'

        return base_path

      toggleSeries: (svg, index) ->
        isVisible = false

        svg.select('.content').selectAll('.series_' + index)
          .style('display', (s) ->
            if d3.select(this).style('display') is 'none'
              isVisible = true
              return 'initial'
            else
              isVisible = false
              return 'none'
          )

        return isVisible

# ----


# src/utils/lines.coffee
      drawLines: (svg, scales, data, options, handlers) ->
        drawers =
          y: this.createLeftLineDrawer(scales, options.lineMode, options.tension)
          y2: this.createRightLineDrawer(scales, options.lineMode, options.tension)

        lineJoin = svg.select('.content').selectAll('.lineGroup')
          .data(data.filter (s) -> s.type in ['line', 'area'])
        
        lineGroup = lineJoin.enter()
          .append('g')
          .attr('class', (s) -> "lineGroup series_#{s.index}")
        
        lineJoin.style('stroke', (s) -> s.color)

        lineJoin.each (series) ->
          dataJoin = d3.select(this).selectAll('path')
            .data([series])

          dataJoin.enter()
            .append('path')
            .attr('class', 'line')

          dataJoin
            .attr('d', (d) -> drawers[d.axis](d.values))
            .style(
              'fill': 'none'
              'stroke-width': (s) -> s.thickness
              'stroke-dasharray': (s) ->
                return '10,3' if s.lineMode is 'dashed'
                return undefined
            )

        if options.tooltip.interpolate
          interpolateData = (series) ->
            target = d3.select(d3.event.target)
            try
              mousePos = d3.mouse(this)
            catch error
              mousePos = [0, 0]
            # interpolate between min/max based on mouse coords
            valuesData = target.datum().values
            # find min/max coords and values
            for datum, i in valuesData
              x = scales.xScale(datum.x)
              y = scales.yScale(datum.y)
              if !minXPos? or x < minXPos
                minXPos = x
                minXValue = datum.x
              if !maxXPos? or x > maxXPos
                maxXPos = x
                maxXValue = datum.x
              if !minYPos? or y < minYPos
                minYPos = y
              if !maxYPos? or y > maxYPos
                maxYPos = y
              if !minYValue? or datum.y < minYValue
                minYValue = datum.y
              if !maxYValue? or datum.y > maxYValue
                maxYValue = datum.y

            xPercentage = (mousePos[0] - minXPos) / (maxXPos - minXPos)
            yPercentage = (mousePos[1] - minYPos) / (maxYPos - minYPos)
            xVal = Math.round(xPercentage * (maxXValue - minXValue) + minXValue)
            yVal = Math.round((1 - yPercentage) * (maxYValue - minYValue) + minYValue)

            interpDatum = x: xVal, y: yVal

            handlers.onMouseOver?(svg, {
              series: series
              x: mousePos[0]
              y: mousePos[1]
              datum: interpDatum
            }, options.axes)

          lineGroup
            .on('mousemove', interpolateData)
            .on('mouseout', (d) -> handlers.onMouseOut?(svg))

        return this

      createLeftLineDrawer: (scales, mode, tension) ->
        return d3.svg.line()
          .x (d) -> scales.xScale(d.x)
          .y (d) -> scales.yScale(d.y + d.y0)
          .interpolate(mode)
          .tension(tension)

      createRightLineDrawer: (scales, mode, tension) ->
        return d3.svg.line()
          .x (d) -> scales.xScale(d.x)
          .y (d) -> scales.y2Scale(d.y + d.y0)
          .interpolate(mode)
          .tension(tension)

# ----


# src/utils/misc.coffee
      getPixelCssProp: (element, propertyName) ->
        string = $window.getComputedStyle(element, null)
          .getPropertyValue(propertyName)
        return +string.replace(/px$/, '')

      getDefaultMargins: ->
        return {top: 20, right: 50, bottom: 60, left: 50}

      getDefaultThumbnailMargins: ->
        return {top: 1, right: 1, bottom: 2, left: 0}

      getElementDimensions: (element, width, height) ->
        dim = {}
        parent = element

        top = this.getPixelCssProp(parent, 'padding-top')
        bottom = this.getPixelCssProp(parent, 'padding-bottom')
        left = this.getPixelCssProp(parent, 'padding-left')
        right = this.getPixelCssProp(parent, 'padding-right')

        dim.width = +(width || parent.offsetWidth || 900) - left - right
        dim.height = +(height || parent.offsetHeight || 500) - top - bottom

        return dim

      getDimensions: (options, element, attrs) ->
        dim = this.getElementDimensions(element[0].parentElement, attrs.width, attrs.height)
        dim = angular.extend(options.margin, dim)

        return dim

      clean: (element) ->
        d3.select(element)
          .on('keydown', null)
          .on('keyup', null)
          .select('svg')
            .remove()

      uuid: () ->
        # @src: http://stackoverflow.com/a/2117523
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
          /[xy]/g, (c) ->
            r = Math.random()*16|0
            v = if c == 'x' then r else r&0x3|0x8
            return v.toString(16)
          )

      bootstrap: (element, id, dimensions) ->
        d3.select(element).classed('chart', true)

        width = dimensions.width
        height = dimensions.height

        svg = d3.select(element).append('svg')
          .attr(
            width: width
            height: height
          )
          .append('g')
            .attr('transform', 'translate(' + dimensions.left + ',' + dimensions.top + ')')

        defs = svg.append('defs')
          .attr('class', 'patterns')
        
        # Add a clipPath for the content area
        defs.append('clipPath')
          .attr('class', 'content-clip')
          .attr('id', "content-clip-#{id}")
          .append('rect')
            .attr({
              'x': 0
              'y': 0
              'width': width - dimensions.left - dimensions.right
              'height': height - dimensions.top - dimensions.bottom
            })

        return svg

      createContent: (svg, id, options) ->
        content = svg.append('g')
          .attr('class', 'content')
        
        if options.hideOverflow
          content.attr('clip-path', "url(#content-clip-#{id})")

      createZoomResetIcon: (svg, dimensions, axes, data, columnWidth, options, handlers, dispatch, zoom) ->
        self = this
        path = 'M22.646,19.307c0.96-1.583,1.523-3.435,1.524-5.421C24.169,8.093,19.478,3.401,13.688,3.399C7.897,3.401,3.204,8.093,3.204,13.885c0,5.789,4.693,10.481,10.484,10.481c1.987,0,3.839-0.563,5.422-1.523l7.128,7.127l3.535-3.537L22.646,19.307zM13.688,20.369c-3.582-0.008-6.478-2.904-6.484-6.484c0.006-3.582,2.903-6.478,6.484-6.486c3.579,0.008,6.478,2.904,6.484,6.486C20.165,17.465,17.267,20.361,13.688,20.369zM8.854,11.884v4.001l9.665-0.001v-3.999L8.854,11.884z'

        iconJoin = svg.select('.focus-container')
          .selectAll('.icon.zoom-reset')
          .data([1])

        icon = iconJoin.enter()
          .append('g')
          .attr('class', 'icon zoom-reset')
          .on('click', () ->
            self.resetZoom(svg, dimensions, axes, data, columnWidth, options, handlers, dispatch, zoom)
            d3.select(this).remove()
          )
          .on('mouseenter', () ->
            d3.select(this).style('fill', 'steelblue')
          )
          .on('mouseout', () ->
            d3.select(this).style('fill', 'black')
          )

        icon.append('path').attr('d', path)

        left = dimensions.width - dimensions.left - dimensions.right - 24
        top = 2
        scale = 0.7

        iconJoin
          .style({
            'fill': 'black'
            'stroke': 'white'
            'stroke-width': 1.5
          })
          .attr({
            opacity: 1
            transform: "translate(#{left}, #{top}) scale(#{scale})"
          })

      createFocus: (svg, dimensions, options) ->
        glass = svg.append('g')
          .attr(
            'class': 'focus-container'
          )

      createGlass: (svg, dimensions, handlers, axes, data, options, dispatch, columnWidth) ->
        that = this

        glass = svg.append('g')
          .attr(
            'class': 'glass-container'
            'opacity': 0
          )

        scrubberGroup = glass.selectAll('.scrubberItem')
          .data(data).enter()
            .append('g')
              .attr('class', (s, i) -> "scrubberItem series_#{i}")

        scrubberGroup.each (s, i) ->

          item = d3.select(this)

          g = item.append('g')
            .attr('class': "rightTT")

          g.append('path')
            .attr(
              'class': "scrubberPath series_#{i}"
              'y': '-7px'
              'fill': s.color
            )

          that.styleTooltip(g.append('text')
            .style('text-anchor', 'start')
            .attr(
              'class': (d, i) -> "scrubberText series_#{i}"
              'height': '14px'
              'transform': 'translate(7, 3)'
              'text-rendering': 'geometric-precision'
            ))
            .text(s.label || s.y)

          g2 = item.append('g')
            .attr('class': "leftTT")

          g2.append('path')
            .attr(
              'class': "scrubberPath series_#{i}"
              'y': '-7px'
              'fill': s.color
            )

          that.styleTooltip(g2.append('text')
            .style('text-anchor', 'end')
            .attr(
              'class': "scrubberText series_#{i}"
              'height': '14px'
              'transform': 'translate(-13, 3)'
              'text-rendering': 'geometric-precision'
            ))
            .text(s.label || s.y)

          item.append('circle')
            .attr(
              'class': "scrubberDot series_#{i}"
              'fill': 'white'
              'stroke': s.color
              'stroke-width': '2px'
              'r': 4
            )

        glass.append('rect')
          .attr(
            class: 'glass'
            width: dimensions.width - dimensions.left - dimensions.right
            height: dimensions.height - dimensions.top - dimensions.bottom
          )
          .style('fill', 'white')
          .style('fill-opacity', 0.000001)
          .on('mouseover', ->
            handlers.onChartHover(svg, d3.select(this), axes, data, options, dispatch, columnWidth)
          )

      drawData: (svg, dimensions, axes, data, columnWidth, options, handlers, dispatch) ->
        this
          .drawArea(svg, axes, data, options, handlers)
          .drawColumns(svg, axes, data, columnWidth, options, handlers, dispatch)
          .drawLines(svg, axes, data, options, handlers)

        if options.drawDots
          this.drawDots(svg, axes, data, options, handlers, dispatch)

      getDataPerSeries: (data, options) ->
        series = options.series
        axes = options.axes

        return [] unless series and series.length and data and data.length

        straightened = series.map (s, i) ->
          seriesData =
            index: i
            name: s.y
            values: []
            color: s.color
            axis: s.axis || 'y'
            xOffset: 0
            type: s.type
            thickness: s.thickness
            drawDots: s.drawDots isnt false


          if s.dotSize?
            seriesData.dotSize = s.dotSize

          if s.striped is true
            seriesData.striped = true

          if s.lineMode?
            seriesData.lineMode = s.lineMode

          if s.id
            seriesData.id = s.id

          data.filter((row) -> row[s.y]?).forEach (row) ->
            d =
              x: row[options.axes.x.key]
              y: row[s.y]
              y0: 0
              axis: s.axis || 'y'

            d.dotSize = s.dotSize if s.dotSize?
            seriesData.values.push(d)

          return seriesData

        if !options.stacks? or options.stacks.length is 0
          return straightened

        layout = d3.layout.stack()
          .values (s) -> s.values

        options.stacks.forEach (stack) ->
          return unless stack.series.length > 0
          layers = straightened
            .filter (s, i) -> series[i].visible is undefined or series[i].visible
            .filter (s, i) -> s.id? and s.id in stack.series
          layout(layers)

        return straightened

      estimateSideTooltipWidth: (svg, text) ->
        t = svg.append('text')
        t.text('' + text)
        this.styleTooltip(t)

        bbox = this.getTextBBox(t[0][0])
        t.remove()

        return bbox

      getTextBBox: (svgTextElement) ->
        if svgTextElement isnt null
        
          try
            return svgTextElement.getBBox()
        
          catch error
            # NS_ERROR_FAILURE in FF for calling .getBBox()
            # on an element that is not rendered (e.g. display: none)
            # https://bugzilla.mozilla.org/show_bug.cgi?id=612118
            return {height: 0, width: 0, y: 0, x: 0}
        
        return {}

      getWidestTickWidth: (svg, axisKey) ->
        max = 0
        bbox = this.getTextBBox

        ticks = svg.select(".#{axisKey}.axis").selectAll('.tick')
        ticks[0]?.forEach (t) -> max = Math.max(max, bbox(t).width)

        return max

      getWidestOrdinate: (data, series, options) ->
        widest = ''

        data.forEach (row) ->
          series.forEach (series) ->
            v = row[series.y]
            
            if series.axis? and options.axes[series.axis]?.ticksFormatter
              v = options.axes[series.axis].ticksFormatter(v)

            return unless v?

            if ('' + v).length > ('' + widest).length
              widest = v

        return widest

# ----


# src/utils/options.coffee
      getDefaultOptions: ->
        return {
          tooltip: {mode: 'scrubber'}
          lineMode: 'linear'
          tension: 0.7
          margin: this.getDefaultMargins()
          axes: {
            x: {type: 'linear', key: 'x'}
            y: {type: 'linear'}
          }
          series: []
          drawLegend: true
          drawDots: true
          stacks: []
          columnsHGap: 5
          hideOverflow: false
        }

      sanitizeOptions: (options, mode) ->
        options ?= {}

        if mode is 'thumbnail'
          options.drawLegend = false
          options.drawDots = false
          options.tooltip = {mode: 'none', interpolate: false}

        # Parse and sanitize the options
        options.series = this.sanitizeSeriesOptions(options.series)
        options.stacks = this.sanitizeSeriesStacks(options.stacks, options.series)
        options.axes = this.sanitizeAxes(options.axes, this.haveSecondYAxis(options.series))
        options.tooltip = this.sanitizeTooltip(options.tooltip)
        options.margin = this.sanitizeMargins(options.margin)

        options.lineMode or= this.getDefaultOptions().lineMode
        options.tension = if /^\d+(\.\d+)?$/.test(options.tension) then options.tension \
          else this.getDefaultOptions().tension

        options.drawLegend = options.drawLegend isnt false
        options.drawDots = options.drawDots isnt false
        options.columnsHGap = 5 unless angular.isNumber(options.columnsHGap)
        options.hideOverflow = options.hideOverflow or false

        defaultMargin = if mode is 'thumbnail' then this.getDefaultThumbnailMargins() \
          else this.getDefaultMargins()

        # Use default values where no options are defined
        options.series = angular.extend(this.getDefaultOptions().series, options.series)
        options.axes = angular.extend(this.getDefaultOptions().axes, options.axes)
        options.tooltip = angular.extend(this.getDefaultOptions().tooltip, options.tooltip)
        options.margin = angular.extend(defaultMargin, options.margin)

        return options

      sanitizeMargins: (options) ->
        attrs = ['top', 'right', 'bottom', 'left']
        margin = {}

        for opt, value of options
          if opt in attrs
            margin[opt] = parseFloat(value)

        return margin

      sanitizeSeriesStacks: (stacks, series) ->
        return [] unless stacks?

        seriesKeys = {}
        series.forEach (s) -> seriesKeys[s.id] = s

        stacks.forEach (stack) ->
          stack.series.forEach (id) ->
            s = seriesKeys[id]
            if s?
              $log.warn "Series #{id} is not on the same axis as its stack" unless s.axis is stack.axis
            else
              $log.warn "Unknown series found in stack : #{id}" unless s

        return stacks

      sanitizeTooltip: (options) ->
        if !options
          return {mode: 'scrubber'}

        if options.mode not in ['none', 'axes', 'scrubber']
          options.mode = 'scrubber'

        if options.mode is 'scrubber'
          delete options.interpolate
        else
          options.interpolate = !!options.interpolate

        if options.mode is 'scrubber' and options.interpolate
          throw new Error('Interpolation is not supported for scrubber tooltip mode.')

        return options

      sanitizeSeriesOptions: (options) ->
        return [] unless options?

        colors = d3.scale.category10()
        knownIds = {}
        options.forEach (s, i) ->
          if knownIds[s.id]?
            throw new Error("Twice the same ID (#{s.id}) ? Really ?")
          knownIds[s.id] = s if s.id?

        options.forEach (s, i) ->
          s.axis = if s.axis?.toLowerCase() isnt 'y2' then 'y' else 'y2'
          s.color or= colors(i)
          s.type = if s.type in ['line', 'area', 'column'] then s.type else "line"

          if s.type is 'column'
            delete s.thickness
            delete s.lineMode
            delete s.drawDots
            delete s.dotSize
          else if not /^\d+px$/.test(s.thickness)
            s.thickness = '1px'

          if s.type in ['line', 'area']
            if s.lineMode not in ['dashed']
              delete s.lineMode

            if s.drawDots isnt false and !s.dotSize?
              s.dotSize = 2

          if !s.id?
            cnt = 0
            while knownIds["series_#{cnt}"]?
              cnt++
            s.id = "series_#{cnt}"
            knownIds[s.id] = s

          if s.drawDots is false
            delete s.dotSize

        return options

      sanitizeAxes: (axesOptions, secondAxis) ->
        axesOptions = {} unless axesOptions?

        axesOptions.x = this.sanitizeAxisOptions(axesOptions.x)
        axesOptions.x.key or= "x"

        axesOptions.y = this.sanitizeAxisOptions(axesOptions.y)
        axesOptions.y2 = this.sanitizeAxisOptions(axesOptions.y2) if secondAxis

        return axesOptions

      sanitizeExtrema: (axisOptions) ->
        for extremum in ['min', 'max']
          originalValue = axisOptions[extremum]
          if originalValue?
            axisOptions[extremum] = this.sanitizeExtremum(extremum, axisOptions)

            if ! axisOptions[extremum]?
              $log.warn("Invalid #{extremum} value '#{originalValue}' (parsed as #{axisOptions[extremum]}), ignoring it.")

      sanitizeExtremum: (name, axisOptions) ->
        sanitizer = this.sanitizeNumber

        if axisOptions.type == 'date'
          sanitizer = this.sanitizeDate

        return sanitizer(axisOptions[name])

      sanitizeDate: (value) ->
        return undefined unless value?

        if ! (value instanceof Date) || isNaN(value.valueOf()) # see http://stackoverflow.com/questions/10589732
          return undefined

        return value

      sanitizeNumber: (value) ->
        return undefined unless value?

        number = parseFloat(value)

        if isNaN(number)
          return undefined

        return number

      sanitizeAxisOptions: (options) ->
        return {type: 'linear'} unless options?

        options.type or= 'linear'

        if options.ticksRotate?
          options.ticksRotate = this.sanitizeNumber(options.ticksRotate)

        if options.zoomable?
          options.zoomable = options.zoomable or false

        if options.innerTicks?
          options.innerTicks = options.innerTicks or false

        # labelFunction is deprecated and will be remvoed in 2.x
        # please use ticksFormatter instead
        if options.labelFunction?
          options.ticksFormatter = options.labelFunction

        # String to format tick values
        if options.ticksFormat?

          if options.type is 'date'
            # Use d3.time.format as formatter
            options.ticksFormatter = d3.time.format(options.ticksFormat)

          else
            # Use d3.format as formatter
            options.ticksFormatter = d3.format(options.ticksFormat)

          # use the ticksFormatter per default
          # if no tooltip format or formatter is defined
          options.tooltipFormatter ?= options.ticksFormatter

        # String to format tooltip values
        if options.tooltipFormat?

          if options.type is 'date'
            # Use d3.time.format as formatter
            options.tooltipFormatter = d3.time.format(options.tooltipFormat)

          else
            # Use d3.format as formatter
            options.tooltipFormatter = d3.format(options.tooltipFormat)

        if options.ticksInterval?
          options.ticksInterval = this.sanitizeNumber(options.ticksInterval)

        this.sanitizeExtrema(options)

        return options

# ----


# src/utils/scales.coffee
      createAxes: (svg, dimensions, axesOptions) ->
        createY2Axis = axesOptions.y2?

        width = dimensions.width
        height = dimensions.height

        width = width - dimensions.left - dimensions.right
        height = height - dimensions.top - dimensions.bottom

        x = undefined
        if axesOptions.x.type is 'date'
          x = d3.time.scale().rangeRound([0, width])
        else
          x = d3.scale.linear().rangeRound([0, width])
        xAxis = this.createAxis(x, 'x', axesOptions)

        y = undefined
        if axesOptions.y.type is 'log'
          y = d3.scale.log().clamp(true).rangeRound([height, 0])
        else
          y = d3.scale.linear().rangeRound([height, 0])
        y.clamp(true)
        yAxis = this.createAxis(y, 'y', axesOptions)

        y2 = undefined
        if createY2Axis and axesOptions.y2.type is 'log'
          y2 = d3.scale.log().clamp(true).rangeRound([height, 0])
        else
          y2 = d3.scale.linear().rangeRound([height, 0])
        y2.clamp(true)
        y2Axis = this.createAxis(y2, 'y2', axesOptions)


        style = (group) ->
          group.style(
            'font': '10px Courier'
            'shape-rendering': 'crispEdges'
          )

          group.selectAll('path').style(
            'fill': 'none'
            'stroke': '#000'
          )

        return {
          xScale: x
          yScale: y
          y2Scale: y2
          xAxis: xAxis
          yAxis: yAxis
          y2Axis: y2Axis

          andAddThemIf: (conditions) ->
            if !!conditions.all

              if !!conditions.y
                svg.append('g')
                  .attr('class', 'y grid')
                svg.append('g')
                  .attr('class', 'y axis')
                  .call(yAxis)
                  .call(style)

              if createY2Axis and !!conditions.y2
                svg.append('g')
                  .attr('class', 'y2 grid')
                  .attr('transform', 'translate(' + width + ', 0)')
                svg.append('g')
                  .attr('class', 'y2 axis')
                  .attr('transform', 'translate(' + width + ', 0)')
                  .call(y2Axis)
                  .call(style)

              if !!conditions.x
                svg.append('g')
                  .attr('class', 'x grid')
                  .attr('transform', 'translate(0,' + height + ')')
                svg.append('g')
                  .attr('class', 'x axis')
                  .attr('transform', 'translate(0,' + height + ')')
                  .call(xAxis)
                  .call(style)

            return {
              xScale: x
              yScale: y
              y2Scale: y2
              xAxis: xAxis
              yAxis: yAxis
              y2Axis: y2Axis
            }
          }

      createAxis: (scale, key, options) ->
        sides =
          x: 'bottom'
          y: 'left'
          y2: 'right'

        o = options[key]

        axis = d3.svg.axis()
          .scale(scale)
          .orient(sides[key])
          .innerTickSize(4)
          .tickFormat(o?.ticksFormatter)

        return axis unless o?

        # ticks can be either an array of tick values
        if angular.isArray(o.ticks)
          axis.tickValues(o.ticks)
        
        # or a number of ticks (approximately)
        else if angular.isNumber(o.ticks)
          axis.ticks(o.ticks)
        
        # or a range function e.g. d3.time.minute
        else if angular.isFunction(o.ticks)
          axis.ticks(o.ticks, o.ticksInterval)

        return axis

      setDefaultStroke: (selection) ->
        selection
          .attr('stroke', '#000')
          .attr('stroke-width', 1)
          .style('shape-rendering', 'crispEdges')

      setDefaultGrid: (selection) ->
        selection
          .attr('stroke', '#eee')
          .attr('stroke-width', 1)
          .style('shape-rendering', 'crispEdges')

      setScalesDomain: (scales, data, series, svg, options) ->
        this.setXScale(scales.xScale, data, series, options.axes)

        axis = svg.selectAll('.x.axis')
          .call(scales.xAxis)

        if options.axes.x.innerTicks?
          axis.selectAll('.tick>line')
            .call(this.setDefaultStroke)

        if options.axes.x.grid?
          height = options.margin.height - options.margin.top - options.margin.bottom
          xGrid = scales.xAxis
            .tickSize(-height, 0, 0)
          grid = svg.selectAll('.x.grid')
            .call(xGrid)
          grid.selectAll('.tick>line')
            .call(this.setDefaultGrid)

        if options.axes.x.ticksRotate?
          axis.selectAll('.tick>text')
            .attr('dy', null)
            .attr('transform', 'translate(0,5) rotate(' + options.axes.x.ticksRotate + ' 0,6)')
            .style('text-anchor', if options.axes.x.ticksRotate >= 0 then 'start' else 'end')

        if (series.filter (s) -> s.axis is 'y' and s.visible isnt false).length > 0
          yDomain = this.getVerticalDomain(options, data, series, 'y')
          scales.yScale.domain(yDomain).nice()
          axis = svg.selectAll('.y.axis')
            .call(scales.yAxis)

          if options.axes.y.innerTicks?
            axis.selectAll('.tick>line')
              .call(this.setDefaultStroke)

          if options.axes.y.ticksRotate?
            axis.selectAll('.tick>text')
              .attr('transform', 'rotate(' + options.axes.y.ticksRotate + ' -6,0)')
              .style('text-anchor', 'end')

          if options.axes.y.grid?
            width = options.margin.width - options.margin.left - options.margin.right
            yGrid = scales.yAxis
              .tickSize(-width, 0, 0)
            grid = svg.selectAll('.y.grid')
              .call(yGrid)
            grid.selectAll('.tick>line')
              .call(this.setDefaultGrid)

        if (series.filter (s) -> s.axis is 'y2' and s.visible isnt false).length > 0
          y2Domain = this.getVerticalDomain(options, data, series, 'y2')
          scales.y2Scale.domain(y2Domain).nice()
          axis = svg.selectAll('.y2.axis')
            .call(scales.y2Axis)
          if options.axes.y2.innerTicks?
            axis.selectAll('.tick>line')
              .call(this.setDefaultStroke)
          
          if options.axes.y2.ticksRotate?
            axis.selectAll('.tick>text')
              .attr('transform', 'rotate(' + options.axes.y2.ticksRotate + ' 6,0)')
              .style('text-anchor', 'start')

          if options.axes.y2.grid?
            width = options.margin.width - options.margin.left - options.margin.right
            y2Grid = scales.y2Axis
              .tickSize(-width, 0, 0)
            grid = svg.selectAll('.y2.grid')
              .call(y2Grid)
            grid.selectAll('.tick>line')
              .call(this.setDefaultGrid)

      getVerticalDomain: (options, data, series, key) ->
        return [] unless o = options.axes[key]

        if o.ticks? and angular.isArray(o.ticks)
          return [o.ticks[0], o.ticks[o.ticks.length - 1]]

        mySeries = series.filter (s) -> s.axis is key and s.visible isnt false

        domain = this.yExtent(
          series.filter (s) -> s.axis is key and s.visible isnt false
          data
          options.stacks.filter (stack) -> stack.axis is key
        )
        if o.type is 'log'
          domain[0] = if domain[0] is 0 then 0.001 else domain[0]

        domain[0] = o.min if o.min?
        domain[1] = o.max if o.max?

        return domain

      yExtent: (series, data, stacks) ->
        minY = Number.POSITIVE_INFINITY
        maxY = Number.NEGATIVE_INFINITY

        groups = []
        stacks.forEach (stack) ->
          groups.push stack.series.map (id) -> (series.filter (s) -> s.id is id)[0]

        series.forEach (series, i) ->
          isInStack = false

          stacks.forEach (stack) ->
            if series.id in stack.series
              isInStack = true

          groups.push([series]) unless isInStack

        groups.forEach (group) ->
          group = group.filter(Boolean)
          minY = Math.min(minY, d3.min(data, (d) ->
            group.reduce ((a, s) -> Math.min(a, d[s.y]) ), Number.POSITIVE_INFINITY
          ))
          maxY = Math.max(maxY, d3.max(data, (d) ->
            group.reduce ((a, s) -> a + d[s.y]), 0
          ))

        if minY is maxY
          if minY > 0
            return [0, minY*2]
          else
            return [minY*2, 0]

        return [minY, maxY]

      setXScale: (xScale, data, series, axesOptions) ->
        domain = this.xExtent(data, axesOptions.x.key, axesOptions.x.type)
        if series.filter((s) -> s.type is 'column').length
          this.adjustXDomainForColumns(domain, data, axesOptions.x.key)

        o = axesOptions.x
        domain[0] = o.min if o.min?
        domain[1] = o.max if o.max?

        xScale.domain(domain)

      xExtent: (data, key, type) ->
        [from, to] = d3.extent(data, (d) -> d[key])

        if from is to
          if type is 'date'
            # delta of 1 day
            delta = 24*60*60*1000
            return [new Date(+from - delta), new Date(+to + delta)]
          else
            return if from > 0 then [0, from*2] else [from*2, 0]

        return [from, to]

      adjustXDomainForColumns: (domain, data, field) ->
        step = this.getAverageStep(data, field)

        if angular.isDate(domain[0])
          domain[0] = new Date(+domain[0] - step)
          domain[1] = new Date(+domain[1] + step)
        else
          domain[0] = domain[0] - step
          domain[1] = domain[1] + step

      getAverageStep: (data, field) ->
        return 0 unless data.length > 1
        sum = 0
        n = data.length - 1
        i = 0
        while i < n
          sum += data[i + 1][field] - data[i][field]
          i++

        return sum/n

      haveSecondYAxis: (series) ->
        return !series.every (s) -> s.axis isnt 'y2'

# ----


# src/utils/scrubber.coffee
      showScrubber: (svg, glass, axes, data, options, dispatch, columnWidth) ->
        that = this
        glass.on('mousemove', ->
          svg.selectAll('.glass-container').attr('opacity', 1)
          that.updateScrubber(svg, d3.mouse(this), axes, data, options, dispatch, columnWidth)
        )
        glass.on('mouseout', ->
          glass.on('mousemove', null)
          svg.selectAll('.glass-container').attr('opacity', 0)
        )

      getClosestPoint: (values, xValue) ->
        # Create a bisector
        xBisector = d3.bisector( (d) -> d.x ).left
        i = xBisector(values, xValue)

        # Return min and max if index is out of bounds
        return values[0] if i is 0
        return values[values.length - 1] if i > values.length - 1
        
        # get element before bisection
        d0 = values[i - 1]

        # get element after bisection
        d1 = values[i]

        # get nearest element
        d = if xValue - d0.x > d1.x - xValue then d1 else d0

        return d

      updateScrubber: (svg, [x, y], axes, data, options, dispatch, columnWidth) ->
        ease = (element) -> element.transition().duration(50)
        that = this
        positions = []

        data.forEach (series, index) ->
          item = svg.select(".scrubberItem.series_#{index}")

          if options.series[index].visible is false
            item.attr('opacity', 0)
            return

          item.attr('opacity', 1)

          xInvert = axes.xScale.invert(x)
          yInvert = axes.yScale.invert(y)

          v = that.getClosestPoint(series.values, xInvert)

          dispatch.focus(v, series.values.indexOf(v), [xInvert, yInvert])

          text = v.x + ' : ' + v.y
          if options.tooltip.formatter
            text = options.tooltip.formatter(v.x, v.y, options.series[index])

          right = item.select('.rightTT')
          rText = right.select('text')
          rText.text(text)

          left = item.select('.leftTT')
          lText = left.select('text')
          lText.text(text)

          sizes =
            right: that.getTextBBox(rText[0][0]).width + 5
            left: that.getTextBBox(lText[0][0]).width + 5

          side = if series.axis is 'y2' then 'right' else 'left'

          xPos = axes.xScale(v.x)
          if side is 'left'
            side = 'right' if xPos + that.getTextBBox(lText[0][0]).x - 10 < 0
          else if side is 'right'
            side = 'left' if xPos + sizes.right > that.getTextBBox(svg.select('.glass')[0][0]).width

          if side is 'left'
            ease(right).attr('opacity', 0)
            ease(left).attr('opacity', 1)
          else
            ease(right).attr('opacity', 1)
            ease(left).attr('opacity', 0)

          positions[index] = {index, x: xPos, y: axes[v.axis + 'Scale'](v.y + v.y0), side, sizes}

          # Use a coloring function if defined, else use a color string value
          color = if angular.isFunction(series.color) \
            then series.color(v, series.values.indexOf(v)) else series.color
          
          # Color the elements of the scrubber
          item.selectAll('circle').attr('stroke', color)
          item.selectAll('path').attr('fill', color)

        positions = this.preventOverlapping(positions)

        tickLength = Math.max(15, 100/columnWidth)

        data.forEach (series, index) ->
          if options.series[index].visible is false
            return

          p = positions[index]
          item = svg.select(".scrubberItem.series_#{index}")

          tt = item.select(".#{p.side}TT")

          xOffset = (if p.side is 'left' then series.xOffset else (-series.xOffset))

          tt.select('text')
            .attr('transform', ->
              if p.side is 'left'
                return "translate(#{-3 - tickLength - xOffset}, #{p.labelOffset+3})"
              else
                return "translate(#{4 + tickLength + xOffset}, #{p.labelOffset+3})"
            )

          tt.select('path')
            .attr(
              'd',
              that.getScrubberPath(
                p.sizes[p.side] + 1,
                p.labelOffset,
                p.side,
                tickLength + xOffset
              )
            )

          ease(item).attr(
            'transform': """
              translate(#{positions[index].x + series.xOffset}, #{positions[index].y})
            """
          )


      getScrubberPath: (w, yOffset, side, padding) ->
        h = 18
        p = padding
        w = w
        xdir = if side is 'left' then 1 else -1

        ydir = 1
        if yOffset isnt 0
          ydir = Math.abs(yOffset)/yOffset

        yOffset or= 0

        return [
          "m0 0"

          "l#{xdir} 0"
          "l0 #{yOffset + ydir}"
          "l#{-xdir*(p + 1)} 0"

          "l0 #{-h/2 - ydir}"
          "l#{-xdir*w} 0"
          "l0 #{h}"
          "l#{xdir*w} 0"
          "l0 #{-h/2 - ydir}"

          "l#{xdir*(p - 1)} 0"
          "l0 #{-yOffset + ydir}"
          "l1 0"

          "z"
        ].join('')


      preventOverlapping: (positions) ->
        h = 18

        abscissas = {}
        positions.forEach (p) ->
          abscissas[p.x] or= {left: [], right: []}
          abscissas[p.x][p.side].push(p)

        getNeighbours = (side) ->
          neighbours = []
          for x, sides of abscissas
            if sides[side].length is 0
              continue

            neighboursForX = {}
            while sides[side].length > 0
              p = sides[side].pop()
              foundNeighbour = false
              for y, neighbourhood of neighboursForX
                if +y - h <= p.y <= +y + h
                  neighbourhood.push(p)
                  foundNeighbour = true

              neighboursForX[p.y] = [p] unless foundNeighbour

            neighbours.push(neighboursForX)
          return neighbours

        offset = (neighboursForAbscissas) ->
          step = 20
          for abs, xNeighbours of neighboursForAbscissas
            for y, neighbours of xNeighbours
              n = neighbours.length
              if n is 1
                neighbours[0].labelOffset = 0
                continue
              neighbours = neighbours.sort (a, b) -> a.y - b.y
              if n%2 is 0
                start = -(step/2)*(n/2)
              else
                start = -(n-1)/2*step

              neighbours.forEach (neighbour, i) -> neighbour.labelOffset = start + step*i
          return


        offset(getNeighbours('left'))
        offset(getNeighbours('right'))

        return positions

# ----


# src/utils/tooltips.coffee
      getTooltipHandlers: (options) ->
        if options.tooltip.mode is 'scrubber'
          return {
            onChartHover: angular.bind(this, this.showScrubber)
          }
        else
          return {
            onMouseOver: angular.bind(this, this.onMouseOver)
            onMouseOut: angular.bind(this, this.onMouseOut)
          }

      styleTooltip: (d3TextElement) ->
        # This needs to be defined as .attr() otherwise
        # FF will not render and compute it properly
        return d3TextElement.attr({
          'font-family': 'monospace'
          'font-size': 10
          'fill': 'white'
          'text-rendering': 'geometric-precision'
        })

      addTooltips: (svg, dimensions, axesOptions) ->
        width = dimensions.width
        height = dimensions.height

        width = width - dimensions.left - dimensions.right
        height = height - dimensions.top - dimensions.bottom

        w = 24
        h = 18
        p = 5

        xTooltip = svg.append('g')
          .attr(
            'id': 'xTooltip'
            'class': 'xTooltip'
            'opacity': 0
          )

        xTooltip.append('path')
          .attr('transform', "translate(0,#{(height + 1)})")

        this.styleTooltip(xTooltip.append('text')
          .style('text-anchor', 'middle')
          .attr(
            'width': w
            'height': h
            'transform': 'translate(0,' + (height + 19) + ')'
          )
        )

        yTooltip = svg.append('g')
          .attr(
            id: 'yTooltip'
            class: 'yTooltip'
            opacity: 0
          )

        yTooltip.append('path')
        this.styleTooltip(yTooltip.append('text')
          .attr(
            'width': h
            'height': w
          )
        )

        if axesOptions.y2?
          y2Tooltip = svg.append('g')
            .attr(
              'id': 'y2Tooltip'
              'class': 'y2Tooltip'
              'opacity': 0
              'transform': 'translate(' + width + ',0)'
            )

          y2Tooltip.append('path')

          this.styleTooltip(y2Tooltip.append('text')
            .attr(
              'width': h
              'height': w
            )
          )

      onMouseOver: (svg, event, axesOptions) ->
        this.updateXTooltip(svg, event, axesOptions.x)

        if event.series.axis is 'y2'
          this.updateY2Tooltip(svg, event, axesOptions.y2)
        else
          this.updateYTooltip(svg, event, axesOptions.y)

      onMouseOut: (svg) ->
        this.hideTooltips(svg)

      updateXTooltip: (svg, {x, datum, series}, xAxisOptions) ->
        xTooltip = svg.select("#xTooltip")

        xTooltip.transition()
          .attr(
            'opacity': 1.0
            'transform': "translate(#{x},0)"
          )

        _f = xAxisOptions.tooltipFormatter
        textX = if _f then _f(datum.x) else datum.x

        label = xTooltip.select('text')
        label.text(textX)

        # Use a coloring function if defined, else use a color string value
        color = if angular.isFunction(series.color) \
          then series.color(datum, series.values.indexOf(datum)) else series.color

        xTooltip.select('path')
          .style('fill', color)
          .attr('d', this.getXTooltipPath(label[0][0]))

      getXTooltipPath: (textElement) ->
        w = Math.max(this.getTextBBox(textElement).width, 15)
        h = 18
        p = 5 # Size of the 'arrow' that points towards the axis

        return 'm-' + w/2 + ' ' + p + ' ' +
          'l0 ' + h + ' ' +
          'l' + w + ' 0 ' +
          'l0 ' + '' + (-h) +
          'l' + (-w/2 + p) + ' 0 ' +
          'l' + (-p) + ' -' + h/4 + ' ' +
          'l' + (-p) + ' ' + h/4 + ' ' +
          'l' + (-w/2 + p) + ' 0z'

      updateYTooltip: (svg, {y, datum, series}, yAxisOptions) ->
        yTooltip = svg.select("#yTooltip")
        yTooltip.transition()
          .attr(
            'opacity': 1.0
            'transform': "translate(0, #{y})"
          )

        _f = yAxisOptions.tooltipFormatter
        textY = if _f then _f(datum.y) else datum.y

        label = yTooltip.select('text')
        label.text(textY)
        w = this.getTextBBox(label[0][0]).width + 5

        label.attr(
          'transform': 'translate(' + (- w - 2) + ',3)'
          'width': w
        )

        # Use a coloring function if defined, else use a color string value
        color = if angular.isFunction(series.color) \
          then series.color(datum, series.values.indexOf(datum)) else series.color

        yTooltip.select('path')
          .style('fill', color)
          .attr('d', this.getYTooltipPath(w))

      updateY2Tooltip: (svg, {y, datum, series}, yAxisOptions) ->
        y2Tooltip = svg.select("#y2Tooltip")
        y2Tooltip.transition()
          .attr('opacity', 1.0)

        _f = yAxisOptions.tooltipFormatter
        textY = if _f then _f(datum.y) else datum.y

        label = y2Tooltip.select('text')
        label.text(textY)
        w = this.getTextBBox(label[0][0]).width + 5
        label.attr(
          'transform': 'translate(7, ' + (parseFloat(y) + 3) + ')'
          'w': w
        )

        # Use a coloring function if defined, else use a color string value
        color = if angular.isFunction(series.color) \
          then series.color(datum, series.values.indexOf(datum)) else series.color

        y2Tooltip.select('path')
          .style('fill', color)
          .attr(
            'd': this.getY2TooltipPath(w)
            'transform': 'translate(0, ' + y + ')'
          )

      getYTooltipPath: (w) ->
        h = 18
        p = 5 # Size of the 'arrow' that points towards the axis

        return 'm0 0' +
          'l' + (-p) + ' ' + (-p) + ' ' +
          'l0 ' + (-h/2 + p) + ' ' +
          'l' + (-w) + ' 0 ' +
          'l0 ' + h + ' ' +
          'l' + w + ' 0 ' +
          'l0 ' + (-h/2 + p) +
          'l' + (-p) + ' ' + p + 'z'

      getY2TooltipPath: (w) ->
        h = 18
        p = 5 # Size of the 'arrow' that points towards the axis

        return 'm0 0' +
          'l' + p + ' ' + p + ' ' +
          'l0 ' + (h/2 - p) + ' ' +
          'l' + w + ' 0 ' +
          'l0 ' + (-h) + ' ' +
          'l' + (-w) + ' 0 ' +
          'l0 ' + (h/2 - p) + ' ' +
          'l' + (-p) + ' ' + p + 'z'

      hideTooltips: (svg) ->
        svg.select("#xTooltip")
          .transition()
          .attr('opacity', 0)

        svg.select("#yTooltip")
          .transition()
          .attr('opacity', 0)

        svg.select("#y2Tooltip")
          .transition()
          .attr('opacity', 0)

# ----
  }
])

# ----
