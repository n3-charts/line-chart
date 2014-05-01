###
line-chart - v1.0.6 - 01 May 2014
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

# ----

# /tmp/utils.coffee
mod = angular.module('n3charts.utils', [])

mod.factory('n3utils', ['$window', ($window) ->
  return {
# lib/utils/areas.coffee
      addPattern: (svg, series) ->
        group = svg.select('defs').append('pattern').attr(
          id: series.type + 'Pattern_' + series.index
          patternUnits: "userSpaceOnUse"
          x: 0
          y: 0
          width: 60
          height: 60
        ).append('g')
          .style(
            'fill': series.color
            'fill-opacity': 0.3
          )

        group.append('rect')
          .style('fill-opacity', 0.3)
          .attr('width', 60)
          .attr('height', 60)

        group.append('path')
          .attr('d', "M 10 0 l10 0 l -20 20 l 0 -10 z")

        group.append('path')
          .attr('d', "M40 0 l10 0 l-50 50 l0 -10 z")

        group.append('path')
          .attr('d', "M60 10 l0 10 l-40 40 l-10 0 z")

        group.append('path')
          .attr('d', "M60 40 l0 10 l-10 10 l -10 0 z")

      drawArea: (svg, scales, data, options) ->
        areaSeries = data.filter (series) -> series.type is 'area'

        areaSeries.forEach( ((series) -> this.addPattern(svg, series)), this )

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
          .y0 (d) -> return scales.yScale(0)
          .y1 (d) -> return scales.yScale(d.value)
          .interpolate(mode)
          .tension(tension)

      createRightAreaDrawer: (scales, mode, tension) ->
        return d3.svg.area()
          .x (d) -> return scales.xScale(d.x)
          .y0 (d) -> return scales.y2Scale(0)
          .y1 (d) -> return scales.y2Scale(d.value)
          .interpolate(mode)
          .tension(tension)

# ----


# lib/utils/columns.coffee
      getBestColumnWidth: (dimensions, data) ->
        return 10 unless data and data.length isnt 0

        # +2 because abscissas will be extended to one more row at each end
        n = data[0].values.length + 2
        seriesCount = data.length
        gap = 0 # space between two rows
        avWidth = dimensions.width - dimensions.left - dimensions.right

        return parseInt(Math.max((avWidth - (n - 1)*gap) / (n*seriesCount), 5))

      drawColumns: (svg, axes, data, columnWidth) ->
        data = data.filter (s) -> s.type is 'column'

        x1 = d3.scale.ordinal()
          .domain(data.map (s) -> s.name)
          .rangeRoundBands([0, data.length * columnWidth], 0.05)

        that = this

        colGroup = svg.select('.content').selectAll('.columnGroup')
          .data(data)
          .enter().append("g")
            .attr('class', (s) -> 'columnGroup ' + 'series_' + s.index)
            .style("fill", (s) -> s.color)
            .style("fill-opacity", 0.8)
            .attr("transform", (s) -> "translate(" + (x1(s.name) - data.length*columnWidth/2) + ",0)")
            .on('mouseover', (series) ->
              target = d3.select(d3.event.target)

              that.onMouseOver(svg, {
                series: series
                x: target.attr('x')
                y: axes[series.axis + 'Scale'](target.datum().value)
                datum: target.datum()
              })
            )
            .on('mouseout', (d) ->
              d3.select(d3.event.target).attr('r', 2)
              that.onMouseOut(svg)
            )

        colGroup.selectAll("rect")
          .data (d) -> d.values
          .enter().append("rect")
            .style("fill-opacity", (d) -> if d.value is 0 then 0 else 1)

            .attr(
              width: columnWidth
              x: (d) -> axes.xScale(d.x)
              height: (d) ->
                return axes[d.axis + 'Scale'].range()[0] if d.value is 0
                return Math.abs(axes[d.axis + 'Scale'](d.value) - axes[d.axis + 'Scale'](0))
              y: (d) ->
                if d.value is 0 then 0 else axes[d.axis + 'Scale'](Math.max(0, d.value))
            )

        return this

      updateColumns: (svg, scales, columnWidth) ->
        svg.select('.content').selectAll('.columnGroup').selectAll('rect')
          .attr(
            width: columnWidth
            x: (d) -> scales.xScale(d.x)
            y: (d) -> scales[d.axis + 'Scale'](Math.max(0, d.value))
            height: (d) ->
              Math.abs(
                scales[d.axis + 'Scale'](d.value) - scales[d.axis + 'Scale'](0)
              )
          )

        return this

# ----


# lib/utils/dots.coffee
      drawDots: (svg, axes, data) ->
        that = this

        svg.select('.content').selectAll('.dotGroup')
          .data data.filter (s) -> s.type in ['line', 'area']
          .enter().append('g')
            .attr(
              class: (s) -> "dotGroup series_#{s.index}"
              fill: (s) -> s.color
            )
            .on('mouseover', (series) ->
              target = d3.select(d3.event.target)
              target.attr('r', 4)

              that.onMouseOver(svg, {
                series: series
                x: target.attr('cx')
                y: target.attr('cy')
                datum: target.datum()
              })
            )
            .on('mouseout', (d) ->
              d3.select(d3.event.target).attr('r', 2)
              that.onMouseOut(svg)
            )
            .selectAll('.dot').data (d) -> d.values
              .enter().append('circle')
              .attr(
                'class': 'dot'
                'r': 2
                'cx': (d) -> axes.xScale(d.x)
                'cy': (d) -> axes[d.axis + 'Scale'](d.value)
              )
              .style(
                'stroke': 'white'
                'stroke-width': '2px'
              )

        return this

      updateDots: (svg, scales) ->
        svg.select('.content').selectAll('.dotGroup').selectAll('.dot')
          .attr(
            'cx': (d) -> scales.xScale(d.x)
            'cy': (d) -> scales[d.axis + 'Scale'](d.value)
          )

        return this

# ----


# lib/utils/legend.coffee
      drawLegend: (svg, series, dimensions) ->
        layout = [0]

        i = 1
        while i < series.length
          l = series[i - 1].label or series[i - 1].y
          layout.push @getTextWidth(l) + layout[i - 1] + 40
          i++


        that = this
        legend = svg.append('g').attr('class', 'legend')

        d = 16
        svg.select('defs').append('svg:clipPath')
          .attr('id', 'legend-clip')
          .append('circle').attr('r', d/2)

        item = legend.selectAll('.legendItem')
          .data(series)
          .enter().append('g')
            .attr(
              'class': 'legendItem'
              'transform': (s, i) -> "translate(#{layout[i]},#{dimensions.height-40})"
            )

        item.on('click', (s, i) ->
          d3.select(this).attr('opacity', if that.toggleSeries(svg, i) then '1' else '0.2')
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
            'font-family': 'monospace'
            'font-size': 10
            'transform': 'translate(13, 4)'
            'text-rendering': 'geometric-precision'
          )
          .text (s) -> s.label || s.y

        return this

      getLegendItemPath: (series, w, h) ->
        if series.type is 'column'
          path = 'M-' + w/3 + ' -' + h/8 + ' l0 ' + h + ' '
          path += 'M0' + ' -' + h/3 + ' l0 ' + h + ' '
          path += 'M' +w/3 + ' -' + h/10 + ' l0 ' + h + ' '

          return path

        base_path = 'M-' + w/2 + ' 0' + h/3 + ' l' + w/3 + ' -' + h/3 + ' l' + w/3 + ' ' +  h/3 + ' l' + w/3 + ' -' + 2*h/3

        base_path + ' l0 ' + h + ' l-' + w + ' 0z' if series.type is 'area'

        return base_path

      toggleSeries: (svg, index) ->
        isVisible = false

        svg.select('.content').selectAll('.series_' + index)
          .attr('opacity', (s) ->
            if d3.select(this).attr('opacity') is '0'
              isVisible = true
              return '1'

            isVisible = false
            return '0'
          )

        return isVisible

# ----


# lib/utils/lines.coffee
      drawLines: (svg, scales, data, options) ->
        drawers =
          y: this.createLeftLineDrawer(scales, options.lineMode, options.tension)
          y2: this.createRightLineDrawer(scales, options.lineMode, options.tension)

        svg.select('.content').selectAll('.lineGroup')
          .data data.filter (s) -> s.type in ['line', 'area']
          .enter().append('g')
            .style('stroke', (s) -> s.color)
            .attr('class', (s) -> "lineGroup series_#{s.index}")
            .append('path')
              .attr(
                class: 'line'
                d: (d) -> drawers[d.axis](d.values)
              )
              .style(
                'fill': 'none'
                'stroke-width': (s) -> s.thickness
              )

        return this

      createLeftLineDrawer: (scales, mode, tension) ->
        return d3.svg.line()
          .x (d) -> scales.xScale(d.x)
          .y (d) -> scales.yScale(d.value)
          .interpolate(mode)
          .tension(tension)

      createRightLineDrawer: (scales, mode, tension) ->
        return d3.svg.line()
          .x (d) -> scales.xScale(d.x)
          .y (d) -> scales.y2Scale(d.value)
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

      getDataPerSeries: (data, options) ->
        series = options.series
        axes = options.axes

        return [] unless series and series.length and data and data.length

        straightenedData = []

        series.forEach (s) ->
          seriesData =
            xFormatter: axes.x.tooltipFormatter
            index: straightenedData.length
            name: s.y
            values: []
            striped: if s.striped is true then true else undefined
            color: s.color
            axis: s.axis || 'y'
            type: s.type
            thickness: s.thickness

          data.filter((row) -> row[s.y]?).forEach (row) ->
            seriesData.values.push(
              x: row[options.axes.x.key]
              value: row[s.y]
              axis: s.axis || 'y'
            )

          straightenedData.push(seriesData)

        return straightenedData

      resetMargins: (dimensions) ->
        defaults = this.getDefaultMargins()

        dimensions.left = defaults.left
        dimensions.right = defaults.right
        dimensions.top = defaults.top
        dimensions.bottom = defaults.bottom

      adjustMargins: (dimensions, options, data) ->
        this.resetMargins(dimensions)

        return unless data and data.length

        series = options.series

        leftSeries = series.filter (s) -> s.axis isnt 'y2'
        leftWidest = this.getWidestOrdinate(data, leftSeries)
        dimensions.left = this.getTextWidth('' + leftWidest) + 20

        rightSeries = series.filter (s) -> s.axis is 'y2'
        return unless rightSeries.length

        rightWidest = this.getWidestOrdinate(data, rightSeries)
        dimensions.right = this.getTextWidth('' + rightWidest) + 20

      adjustMarginsForThumbnail: (dimensions, axes) ->
        dimensions.top = 1
        dimensions.bottom = 2
        dimensions.left = 0
        dimensions.right = 1

      getTextWidth: (text) ->
        # return Math.max(25, text.length*6.7);
        return parseInt(text.length*5) + 10

      getWidestOrdinate: (data, series) ->
        widest = ''

        data.forEach (row) ->
          series.forEach (series) ->
            return unless row[series.y]?

            if ('' + row[series.y]).length > ('' + widest).length
              widest = row[series.y]

        return widest

# ----


# lib/utils/options.coffee
      getDefaultOptions: ->
        return {
          tooltipMode: 'default'
          lineMode: 'linear'
          tension: 0.7
          axes: {
            x: {type: 'linear', key: 'x'}
            y: {type: 'linear'}
          }
          series: []
        }

      sanitizeOptions: (options) ->
        return this.getDefaultOptions() unless options?

        options.series = this.sanitizeSeriesOptions(options.series)

        options.axes = this.sanitizeAxes(options.axes, this.haveSecondYAxis(options.series))

        options.lineMode or= 'linear'
        options.tension = if /^\d+(\.\d+)?$/.test(options.tension) then options.tension else 0.7

        options.tooltipMode or= 'default'

        return options

      sanitizeSeriesOptions: (options) ->
        return [] unless options?

        colors = d3.scale.category10()
        options.forEach (s, i) ->
          s.color or= colors(i)
          s.type = if s.type in ['line', 'area', 'column'] then s.type else "line"

          if s.type is 'column'
            delete s.thickness
          else if not /^\d+px$/.test(s.thickness)
            s.thickness = '1px'

        return options

      sanitizeAxes: (axesOptions, secondAxis) ->
        axesOptions = {} unless axesOptions?

        axesOptions.x = this.sanitizeAxisOptions(axesOptions.x)
        axesOptions.x.key or= "x"
        axesOptions.y = this.sanitizeAxisOptions(axesOptions.y)
        axesOptions.y2 = this.sanitizeAxisOptions(axesOptions.y2) if secondAxis

        return axesOptions

      sanitizeAxisOptions: (options) ->
        return {type: 'linear'} unless options?

        options.type or= 'linear'

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

        xAxis = d3.svg.axis().scale(x).orient('bottom').tickFormat(axesOptions.x.labelFunction)
        yAxis = d3.svg.axis().scale(y).orient('left').tickFormat(axesOptions.y.labelFunction)
        y2Axis = d3.svg.axis().scale(y2).orient('right').tickFormat(axesOptions.y2?.labelFunction)

        style = (group) ->
          group.style(
            'font': '10px monospace'
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

      setScalesDomain: (scales, data, series, svg, axesOptions) ->
        this.setXScale(scales.xScale, data, series, axesOptions)

        ySeries = series.filter (s) -> s.axis isnt 'y2'
        y2Series = series.filter (s) -> s.axis is 'y2'

        yDomain = this.yExtent(ySeries, data)
        if axesOptions.y.type is 'log'
          yDomain[0] = if yDomain[0] is 0 then 0.001 else yDomain[0]

        y2Domain = this.yExtent(y2Series, data)
        if axesOptions.y2?.type is 'log'
          y2Domain[0] = if y2Domain[0] is 0 then 0.001 else y2Domain[0]

        scales.yScale.domain(yDomain).nice()
        scales.y2Scale.domain(y2Domain).nice()

        svg.selectAll('.x.axis').call(scales.xAxis)
        svg.selectAll('.y.axis').call(scales.yAxis)
        svg.selectAll('.y2.axis').call(scales.y2Axis)

      yExtent: (series, data) ->
        minY = Number.POSITIVE_INFINITY
        maxY = Number.NEGATIVE_INFINITY

        series.forEach (s) ->
          minY = Math.min(minY, d3.min(data, (d) -> d[s.y]))
          maxY = Math.max(maxY, d3.max(data, (d) -> d[s.y]))

        return [minY, maxY]

      setXScale: (xScale, data, series, axesOptions) ->
        xScale.domain(d3.extent(data, (d) -> d[axesOptions.x.key]))

        if series.filter((s) -> s.type is 'column').length
          this.adjustXScaleForColumns(xScale, data, axesOptions.x.key)

      adjustXScaleForColumns: (xScale, data, field) ->
        step = this.getAverageStep(data, field)
        d = xScale.domain()

        if angular.isDate(d[0])
          xScale.domain([new Date(d[0].getTime() - step), new Date(d[1].getTime() + step)])
        else
          xScale.domain([d[0] - step, d[1] + step])

      getAverageStep: (data, field) ->
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


# lib/utils/tooltips.coffee
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

        xTooltip.append('text')
          .style('text-anchor', 'middle')
          .attr(
            'width': w
            'height': h
            'font-family': 'monospace'
            'font-size': 10
            'transform': 'translate(0,' + (height + 19) + ')'
            'fill': 'white'
            'text-rendering': 'geometric-precision'
          )

        yTooltip = svg.append('g')
          .attr(
            id: 'yTooltip'
            class: 'yTooltip'
            opacity: 0
          )

        yTooltip.append('path')
        yTooltip.append('text')
          .attr(
            'width': h
            'height': w
            'font-family': 'monospace'
            'font-size': 10
            'fill': 'white'
            'text-rendering': 'geometric-precision'
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

          y2Tooltip.append('text')
            .attr(
              'width': h
              'height': w
              'font-family': 'monospace'
              'font-size': 10
              'fill': 'white'
              'text-rendering': 'geometric-precision'
            )

      onMouseOver: (svg, target) ->
        this.updateXTooltip(svg, target)

        if target.series.axis is 'y2'
          this.updateY2Tooltip(svg, target)
        else
          this.updateYTooltip(svg, target)

      onMouseOut: (svg) ->
        this.hideTooltips(svg)

      updateXTooltip: (svg, target) ->
        xTooltip = svg.select("#xTooltip")
          .transition()
          .attr(
            'opacity': 1.0
            'transform': 'translate(' + target.x + ',0)'
          )

        textX = undefined
        if target.series.xFormatter?
          textX = '' + target.series.xFormatter(target.datum.x)
        else
          textX = '' + target.datum.x

        xTooltip.select('text').text(textX)
        xTooltip.select('path')
          .attr('fill', target.series.color)
          .attr('d', this.getXTooltipPath(textX))

      getXTooltipPath: (text) ->
        w = this.getTextWidth(text)
        h = 18
        p = 5 # Size of the 'arrow' that points towards the axis

        return 'm-' + w/2 + ' ' + p + ' ' +
          'l0 ' + h + ' ' +
          'l' + w + ' 0 ' +
          'l0 ' + '-' + h +
          'l-' + (w/2 - p) + ' 0 ' +
          'l-' + p + ' -' + h/4 + ' ' +
          'l-' + p + ' ' + h/4 + ' ' +
          'l-' + (w/2 - p) + ' 0z'

      updateYTooltip: (svg, target) ->
        yTooltip = svg.select("#yTooltip")
          .transition()
          .attr(
            'opacity': 1.0
            'transform': 'translate(0, ' + target.y + ')'
          )

        textY = '' + target.datum.value
        w = this.getTextWidth(textY)
        yTooltipText = yTooltip.select('text').text(textY)

        yTooltipText.attr(
          'transform': 'translate(' + (- w - 2) + ',3)'
          'width': w
        )

        yTooltip.select('path')
          .attr('fill', target.series.color)
          .attr('d', this.getYTooltipPath(w))

      getYTooltipPath: (w) ->
        h = 18
        p = 5 # Size of the 'arrow' that points towards the axis

        return 'm0 0' +
          'l-' + p + ' -' + p + ' ' +
          'l0 -' + (h/2 - p) + ' ' +
          'l-' + w + ' 0 ' +
          'l0 ' + h + ' ' +
          'l' + w + ' 0 ' +
          'l0 -' + (h/2 - p) +
          'l-' + p + ' ' + p + 'z'

      updateY2Tooltip: (svg, target) ->
        y2Tooltip = svg.select("#y2Tooltip")
          .transition()
          .attr('opacity', 1.0)

        textY = '' + target.datum.value
        w = this.getTextWidth(textY)
        y2TooltipText = y2Tooltip.select('text').text(textY)
        y2TooltipText.attr(
          'transform': 'translate(7, ' + (parseFloat(target.y) + 3) + ')'
          'w': w
        )

        y2Tooltip.select('path')
          .attr(
            'fill': target.series.color
            'd': this.getY2TooltipPath(w)
            'transform': 'translate(0, ' + target.y + ')'
          )

      getY2TooltipPath: (w) ->
        h = 18
        p = 5 # Size of the 'arrow' that points towards the axis

        return 'm0 0' +
          'l' + p + ' ' + p + ' ' +
          'l0 ' + (h/2 - p) + ' ' +
          'l' + w + ' 0 ' +
          'l0 -' + h + ' ' +
          'l-' + w + ' 0 ' +
          'l0 ' + (h/2 - p) + ' ' +
          'l-' + p + ' ' + p + 'z'

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
