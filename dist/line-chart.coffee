###
line-chart - v1.1.4 - 10 November 2014
https://github.com/n3-charts/line-chart
Copyright (c) 2014 n3-charts
###
# lib/line-chart.coffee
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

    scope.redraw = ->
      scope.updateDimensions(dim)
      scope.update(dim)


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
      axes = _u
        .createAxes(svg, dimensions, options.axes)
        .andAddThemIf(isThumbnail)

      if dataPerSeries.length
        _u.setScalesDomain(axes, scope.data, options.series, svg, options)

      if isThumbnail
        _u.adjustMarginsForThumbnail(dimensions, axes)
      else
        _u.adjustMargins(svg, dimensions, options, scope.data)

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
    scope.$watch('options', scope.redraw, true)

  return {
    replace: true
    restrict: 'E'
    scope: {data: '=', options: '='}
    template: '<div></div>'
    link: link
  }
])

# ----

# /tmp/utils.coffee
mod = angular.module('n3charts.utils', [])

mod.factory('n3utils', ['$window', '$log', '$rootScope', ($window, $log, $rootScope) ->
  return {
# lib/utils/areas.coffee
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

        svg.select('.content').selectAll('.areaGroup')
          .data(areaSeries)
          .enter().append('g')
            .attr('class', (s) -> 'areaGroup ' + 'series_' + s.index)
            .append('path')
              .attr('class', 'area')
              .style('fill', (s) ->
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


# lib/utils/columns.coffee
      getPseudoColumns: (data, options) ->
        data = data.filter (s) -> s.type is 'column'

        pseudoColumns = {}
        keys = []
        data.forEach (series) ->
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

      getBestColumnWidth: (dimensions, seriesData, options) ->
        return 10 unless seriesData and seriesData.length isnt 0

        return 10 if (seriesData.filter (s) -> s.type is 'column').length is 0

        {pseudoColumns, keys} = this.getPseudoColumns(seriesData, options)

        # +2 because abscissas will be extended to one more row at each end
        n = seriesData[0].values.length + 2
        seriesCount = keys.length
        avWidth = dimensions.width - dimensions.left - dimensions.right

        return parseInt(Math.max((avWidth - (n - 1)*options.columnsHGap) / (n*seriesCount), 5))

      getColumnAxis: (data, columnWidth, options) ->
        {pseudoColumns, keys} = this.getPseudoColumns(data, options)

        x1 = d3.scale.ordinal()
          .domain(keys)
          .rangeBands([0, keys.length * columnWidth], 0)

        return (s) ->
          return 0 unless pseudoColumns[s.id]?
          index = pseudoColumns[s.id]
          return x1(index) - keys.length*columnWidth/2


      drawColumns: (svg, axes, data, columnWidth, options, handlers) ->
        data = data.filter (s) -> s.type is 'column'

        x1 = this.getColumnAxis(data, columnWidth, options)

        data.forEach (s) -> s.xOffset = x1(s) + columnWidth*.5

        colGroup = svg.select('.content').selectAll('.columnGroup')
          .data(data)
          .enter().append("g")
            .attr('class', (s) -> 'columnGroup series_' + s.index)
            .style('stroke', (s) -> s.color)
            .style('fill', (s) -> s.color)
            .style('fill-opacity', 0.8)
            .attr('transform', (s) -> "translate(" + x1(s) + ",0)")
            .on('mouseover', (series) ->
              target = d3.select(d3.event.target)

              handlers.onMouseOver?(svg, {
                series: series
                x: target.attr('x')
                y: axes[series.axis + 'Scale'](target.datum().y0 + target.datum().y)
                datum: target.datum()
              })
            )
            .on('mouseout', (d) ->
              d3.select(d3.event.target).attr('r', 2)
              handlers.onMouseOut?(svg)
            )

        colGroup.selectAll("rect")
          .data (d) -> d.values
          .enter().append("rect")
            .style({
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


# lib/utils/dots.coffee
      drawDots: (svg, axes, data, options, handlers) ->
        dotGroup = svg.select('.content').selectAll('.dotGroup')
          .data data.filter (s) -> s.type in ['line', 'area'] and s.drawDots
          .enter().append('g')
        dotGroup.attr(
            class: (s) -> "dotGroup series_#{s.index}"
            fill: (s) -> s.color
          )
          .selectAll('.dot').data (d) -> d.values
            .enter().append('circle')
            .attr(
              'class': 'dot'
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
            target.attr('r', (s) -> s.dotSize + 2)

            handlers.onMouseOver?(svg, {
              series: series
              x: target.attr('cx')
              y: target.attr('cy')
              datum: target.datum()
            })
          )
          .on('mouseout', (d) ->
            d3.select(d3.event.target).attr('r', (s) -> s.dotSize)
            handlers.onMouseOut?(svg)
          )

        return this

# ----


# lib/utils/legend.coffee
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

      drawLegend: (svg, series, dimensions, handlers) ->
        that = this
        legend = svg.append('g').attr('class', 'legend')

        d = 16
        svg.select('defs').append('svg:clipPath')
          .attr('id', 'legend-clip')
          .append('circle').attr('r', d/2)

        item = legend.selectAll('.legendItem')
          .data(series)

        items = item.enter().append('g')
            .attr(
              'class': (s, i) -> "legendItem series_#{i} #{s.axis}"
              'opacity': (s, i) ->
                if s.visible is false
                  that.toggleSeries(svg, i)
                  return '0.2'

                return '1'
            )

        item.on('click', (s, i) ->
          handlers.onSeriesVisibilityChange?({
            series: s,
            index: i,
            newVisibility: !(s.visible isnt false)
          })
        )

        item.append('circle')
          .attr(
            'fill': (s) -> s.color
            'stroke': (s) -> s.color
            'stroke-width': '2px'
            'r': d/2
          )

        item.append('path')
          .attr(
            'clip-path': 'url(#legend-clip)'
            'fill-opacity': (s) -> if s.type in ['area', 'column'] then '1' else '0'
            'fill': 'white'
            'stroke': 'white'
            'stroke-width': '2px'
            'd': (s) -> that.getLegendItemPath(s, d, d)
          )

        item.append('circle')
          .attr(
            'fill-opacity': 0
            'stroke': (s) -> s.color
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
          .text (s) -> s.label || s.y


        [left, right] = this.computeLegendLayout(svg, series, dimensions)
        items.attr(
          'transform': (s, i) ->
            if s.axis is 'y'
              return "translate(#{left.shift()},#{dimensions.height-40})"
            else
              return "translate(#{right.shift()},#{dimensions.height-40})"
        )

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


# lib/utils/lines.coffee
      drawLines: (svg, scales, data, options, handlers) ->
        drawers =
          y: this.createLeftLineDrawer(scales, options.lineMode, options.tension)
          y2: this.createRightLineDrawer(scales, options.lineMode, options.tension)

        lineGroup = svg.select('.content').selectAll('.lineGroup')
          .data data.filter (s) -> s.type in ['line', 'area']
          .enter().append('g')
        lineGroup.style('stroke', (s) -> s.color)
        .attr('class', (s) -> "lineGroup series_#{s.index}")
        .append('path')
          .attr(
            class: 'line'
            d: (d) -> drawers[d.axis](d.values)
          )
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
            })

          lineGroup
            .on 'mousemove', interpolateData
            .on 'mouseout', (d) -> handlers.onMouseOut?(svg)

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


# lib/utils/misc.coffee
      getPixelCssProp: (element, propertyName) ->
        string = $window.getComputedStyle(element, null)
          .getPropertyValue(propertyName)
        return +string.replace(/px$/, '')

      getDefaultMargins: ->
        return {top: 20, right: 50, bottom: 60, left: 50}

      clean: (element) ->
        d3.select(element)
          .on('keydown', null)
          .on('keyup', null)
          .select('svg')
            .remove()

      bootstrap: (element, dimensions) ->
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

        svg.append('defs')
          .attr('class', 'patterns')

        return svg

      createContent: (svg) ->
        svg.append('g').attr('class', 'content')

      createGlass: (svg, dimensions, handlers, axes, data, options, columnWidth) ->
        glass = svg.append('g')
          .attr(
            'class': 'glass-container'
            'opacity': 0
          )

        items = glass.selectAll('.scrubberItem')
          .data(data)
          .enter()
            .append('g')
              .attr('class', (s, i) -> "scrubberItem series_#{i}")

        g = items.append('g')
          .attr('class': (s, i) -> "rightTT")

        g.append('path')
          .attr(
            'class': (s, i) -> "scrubberPath series_#{i}"
            'y': '-7px'
            'fill': (s) -> s.color
          )

        this.styleTooltip(g.append('text')
          .style('text-anchor', 'start')
          .attr(
            'class': (d, i) -> "scrubberText series_#{i}"
            'height': '14px'
            'transform': 'translate(7, 3)'
            'text-rendering': 'geometric-precision'
          ))
          .text (s) -> s.label || s.y

        g2 = items.append('g')
          .attr('class': (s, i) -> "leftTT")

        g2.append('path')
          .attr(
            'class': (s, i) -> "scrubberPath series_#{i}"
            'y': '-7px'
            'fill': (s) -> s.color
          )

        this.styleTooltip(g2.append('text')
          .style('text-anchor', 'end')
          .attr(
            'class': (d, i) -> "scrubberText series_#{i}"
            'height': '14px'
            'transform': 'translate(-13, 3)'
            'text-rendering': 'geometric-precision'
          ))
          .text (s) -> s.label || s.y

        items.append('circle')
          .attr(
            'class': (s, i) -> "scrubberDot series_#{i}"
            'fill': 'white'
            'stroke': (s) -> s.color
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
            handlers.onChartHover(svg, d3.select(d3.event.target), axes, data, options, columnWidth)
          )


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
          layers = straightened.filter (s, i) -> s.id? and s.id in stack.series
          layout(layers)

        return straightened

      resetMargins: (dimensions) ->
        defaults = this.getDefaultMargins()

        dimensions.left = defaults.left
        dimensions.right = defaults.right
        dimensions.top = defaults.top
        dimensions.bottom = defaults.bottom

      adjustMargins: (svg, dimensions, options, data) ->
        this.resetMargins(dimensions)
        return unless data and data.length
        return unless options.series.length

        dimensions.left = this.getWidestTickWidth(svg, 'y')
        dimensions.right = this.getWidestTickWidth(svg, 'y2')

        if dimensions.right is 0 then dimensions.right = 20

        return if options.tooltip.mode is 'scrubber'
        series = options.series

        leftSeries = series.filter (s) -> s.axis isnt 'y2'
        leftWidest = this.getWidestOrdinate(data, leftSeries, options)
        dimensions.left = this.estimateSideTooltipWidth(svg, leftWidest).width + 20

        rightSeries = series.filter (s) -> s.axis is 'y2'
        return unless rightSeries.length

        rightWidest = this.getWidestOrdinate(data, rightSeries, options)
        dimensions.right = this.estimateSideTooltipWidth(svg, rightWidest).width + 20

      adjustMarginsForThumbnail: (dimensions, axes) ->
        dimensions.top = 1
        dimensions.bottom = 2
        dimensions.left = 0
        dimensions.right = 1

      estimateSideTooltipWidth: (svg, text) ->
        t = svg.append('text')
        t.text('' + text)
        this.styleTooltip(t)

        bbox = this.getTextBBox(t[0][0])
        t.remove()

        return bbox

      getTextBBox: (svgTextElement) ->
        return svgTextElement.getBBox()

      getWidestTickWidth: (svg, axisKey) ->
        max = 0
        bbox = this.getTextBBox

        ticks = svg.select(".#{axisKey}.axis").selectAll('.tick')
        ticks[0]?.map (t) -> max = Math.max(max, bbox(t).width)

        return max

      getWidestOrdinate: (data, series, options) ->
        widest = ''

        data.forEach (row) ->
          series.forEach (series) ->
            v = row[series.y]
            if series.axis? and options.axes[series.axis]?.labelFunction
              v = options.axes[series.axis].labelFunction(v)

            return unless v?

            if ('' + v).length > ('' + widest).length
              widest = v

        return widest

# ----


# lib/utils/options.coffee
      getDefaultOptions: ->
        return {
          tooltip: {mode: 'scrubber'}
          lineMode: 'linear'
          tension: 0.7
          axes: {
            x: {type: 'linear', key: 'x'}
            y: {type: 'linear'}
          }
          series: []
          drawLegend: true
          drawDots: true
          stacks: []
          columnsHGap: 5
        }

      sanitizeOptions: (options, mode) ->
        return this.getDefaultOptions() unless options?

        if mode is 'thumbnail'
          options.drawLegend = false
          options.drawDots = false
          options.tooltip = {mode: 'none', interpolate: false}

        options.series = this.sanitizeSeriesOptions(options.series)
        options.stacks = this.sanitizeSeriesStacks(options.stacks, options.series)

        options.axes = this.sanitizeAxes(options.axes, this.haveSecondYAxis(options.series))

        options.lineMode or= 'linear'
        options.tension = if /^\d+(\.\d+)?$/.test(options.tension) then options.tension else 0.7

        this.sanitizeTooltip(options)

        options.drawLegend = options.drawLegend isnt false
        options.drawDots = options.drawDots isnt false

        options.columnsHGap = 5 unless angular.isNumber(options.columnsHGap)

        return options

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
        if !options.tooltip
          options.tooltip = {mode: 'scrubber'}
          return

        if options.tooltip.mode not in ['none', 'axes', 'scrubber']
          options.tooltip.mode = 'scrubber'

        if options.tooltip.mode is 'scrubber'
          delete options.tooltip.interpolate
        else
          options.tooltip.interpolate = !!options.tooltip.interpolate

        if options.tooltip.mode is 'scrubber' and options.tooltip.interpolate
          throw new Error('Interpolation is not supported for scrubber tooltip mode.')

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

      sanitizeExtrema: (options) ->
        min = this.getSanitizedNumber(options.min)
        if min?
          options.min = min
        else
          delete options.min

        max = this.getSanitizedNumber(options.max)
        if max?
          options.max = max
        else
          delete options.max

      getSanitizedNumber: (value) ->
        return undefined unless value?

        number = parseInt(value, 10)

        if isNaN(number)
          $log.warn("Invalid extremum value : #{value}, deleting it.")
          return undefined

        return number

      sanitizeAxisOptions: (options) ->
        return {type: 'linear'} unless options?

        options.type or= 'linear'

        this.sanitizeExtrema(options)

        return options

# ----


# lib/utils/scales.coffee
      createAxes: (svg, dimensions, axesOptions) ->
        drawY2Axis = axesOptions.y2?

        width = dimensions.width
        height = dimensions.height

        width = width - dimensions.left - dimensions.right
        height = height - dimensions.top - dimensions.bottom

        x = undefined
        if axesOptions.x.type is 'date'
          x = d3.time.scale().rangeRound([0, width])
        else
          x = d3.scale.linear().rangeRound([0, width])

        y = undefined
        if axesOptions.y.type is 'log'
          y = d3.scale.log().clamp(true).rangeRound([height, 0])
        else
          y = d3.scale.linear().rangeRound([height, 0])


        y2 = undefined
        if drawY2Axis and axesOptions.y2.type is 'log'
          y2 = d3.scale.log().clamp(true).rangeRound([height, 0])
        else
          y2 = d3.scale.linear().rangeRound([height, 0])

        y.clamp(true)
        y2.clamp(true)

        xAxis = this.createAxis(x, 'x', axesOptions)
        yAxis = this.createAxis(y, 'y', axesOptions)
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

        that = this

        return {
          xScale: x
          yScale: y
          y2Scale: y2
          xAxis: xAxis
          yAxis: yAxis
          y2Axis: y2Axis

          andAddThemIf: (condition) ->
            if not condition
              style(
                svg.append('g')
                  .attr('class', 'x axis')
                  .attr('transform', 'translate(0,' + height + ')')
                  .call(xAxis)
              )

              style(
                svg.append('g')
                  .attr('class', 'y axis')
                  .call(yAxis)
              )

              if drawY2Axis
                style(
                  svg.append('g')
                    .attr('class', 'y2 axis')
                    .attr('transform', 'translate(' + width + ', 0)')
                    .call(y2Axis)
                )

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
          .tickFormat(o?.labelFunction)

        return axis unless o?

        axis.ticks(o.ticks) if angular.isNumber(o.ticks)
        axis.tickValues(o.ticks) if angular.isArray(o.ticks)

        return axis

      setScalesDomain: (scales, data, series, svg, options) ->
        this.setXScale(scales.xScale, data, series, options.axes)

        yDomain = this.getVerticalDomain(options, data, series, 'y')
        y2Domain = this.getVerticalDomain(options, data, series, 'y2')

        scales.yScale.domain(yDomain).nice()
        scales.y2Scale.domain(y2Domain).nice()

        svg.selectAll('.x.axis').call(scales.xAxis)
        svg.selectAll('.y.axis').call(scales.yAxis)
        svg.selectAll('.y2.axis').call(scales.y2Axis)

      getVerticalDomain: (options, data, series, key) ->
        return [] unless o = options.axes[key]

        if o.ticks? and angular.isArray(o.ticks)
          return [o.ticks[0], o.ticks[o.ticks.length - 1]]

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
        domain = this.xExtent(data, axesOptions.x.key)
        if series.filter((s) -> s.type is 'column').length
          this.adjustXDomainForColumns(domain, data, axesOptions.x.key)

        o = axesOptions.x
        domain[0] = o.min if o.min?
        domain[1] = o.max if o.max?

        xScale.domain(domain)

      xExtent: (data, key) ->
        [from, to] = d3.extent(data, (d) -> d[key])

        if from is to
          if from > 0
            return [0, from*2]
          else
            return [from*2, 0]

        return [from, to]

      adjustXDomainForColumns: (domain, data, field) ->
        step = this.getAverageStep(data, field)

        if angular.isDate(domain[0])
          domain[0] = new Date(domain[0].getTime() - step)
          domain[1] = new Date(domain[1].getTime() + step)
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


# lib/utils/scrubber.coffee
      showScrubber: (svg, glass, axes, data, options, columnWidth) ->
        that = this
        glass.on('mousemove', ->
          svg.selectAll('.glass-container').attr('opacity', 1)
          that.updateScrubber(svg, d3.mouse(this), axes, data, options, columnWidth)
        )
        glass.on('mouseout', ->
          glass.on('mousemove', null)
          svg.selectAll('.glass-container').attr('opacity', 0)
        )

      getClosestPoint: (values, value) ->
        # Dichotomy FTW
        left = 0
        right = values.length - 1

        i = Math.round((right - left)/2)
        while true
          if value < values[i].x
            right = i
            i = i - Math.ceil((right-left)/2)
          else
            left = i
            i = i + Math.floor((right-left)/2)

          if i in [left, right]
            if Math.abs(value - values[left].x) < Math.abs(value - values[right].x)
              i = left
            else
              i = right
            break

        return values[i]

      updateScrubber: (svg, [x, y], axes, data, options, columnWidth) ->
        ease = (element) -> element.transition().duration(50)
        that = this
        positions = []

        data.forEach (series, index) ->
          item = svg.select(".scrubberItem.series_#{index}")

          if options.series[index].visible is false
            item.attr('opacity', 0)
            return

          item.attr('opacity', 1)

          v = that.getClosestPoint(series.values, axes.xScale.invert(x))

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

          x = axes.xScale(v.x)
          if side is 'left'
            side = 'right' if x + that.getTextBBox(lText[0][0]).x - 10 < 0
          else if side is 'right'
            side = 'left' if x + sizes.right > that.getTextBBox(svg.select('.glass')[0][0]).width

          if side is 'left'
            ease(right).attr('opacity', 0)
            ease(left).attr('opacity', 1)
          else
            ease(right).attr('opacity', 1)
            ease(left).attr('opacity', 0)

          positions[index] = {index, x: x, y: axes[v.axis + 'Scale'](v.y + v.y0), side, sizes}

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


# lib/utils/tooltips.coffee
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

      onMouseOver: (svg, event) ->
        this.updateXTooltip(svg, event)

        if event.series.axis is 'y2'
          this.updateY2Tooltip(svg, event)
        else
          this.updateYTooltip(svg, event)

      onMouseOut: (svg) ->
        this.hideTooltips(svg)

      updateXTooltip: (svg, {x, datum, series}) ->
        xTooltip = svg.select("#xTooltip")

        xTooltip.transition()
          .attr(
            'opacity': 1.0
            'transform': "translate(#{x},0)"
          )

        textX = datum.x

        label = xTooltip.select('text')
        label.text(textX)

        xTooltip.select('path')
          .attr('fill', series.color)
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

      updateYTooltip: (svg, {y, datum, series}) ->
        yTooltip = svg.select("#yTooltip")
        yTooltip.transition()
          .attr(
            'opacity': 1.0
            'transform': "translate(0, #{y})"
          )

        label = yTooltip.select('text')
        label.text(datum.y)
        w = this.getTextBBox(label[0][0]).width + 5

        label.attr(
          'transform': 'translate(' + (- w - 2) + ',3)'
          'width': w
        )

        yTooltip.select('path')
          .attr('fill', series.color)
          .attr('d', this.getYTooltipPath(w))

      updateY2Tooltip: (svg, {y, datum, series}) ->
        y2Tooltip = svg.select("#y2Tooltip")
        y2Tooltip.transition()
          .attr('opacity', 1.0)

        label = y2Tooltip.select('text')
        label.text(datum.y)
        w = this.getTextBBox(label[0][0]).width + 5
        label.attr(
          'transform': 'translate(7, ' + (parseFloat(y) + 3) + ')'
          'w': w
        )

        y2Tooltip.select('path')
          .attr(
            'fill': series.color
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
