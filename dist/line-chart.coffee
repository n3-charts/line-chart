###
line-chart - v1.0.9 - 26 June 2014
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

# ----

# /tmp/utils.coffee
mod = angular.module('n3charts.utils', [])

mod.factory('n3utils', ['$window', '$log', '$rootScope', ($window, $log, $rootScope) ->
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
      getBestColumnWidth: (dimensions, seriesData) ->
        return 10 unless seriesData and seriesData.length isnt 0

        # +2 because abscissas will be extended to one more row at each end
        n = seriesData[0].values.length + 2
        seriesCount = seriesData.length
        gap = 0 # space between two rows
        avWidth = dimensions.width - dimensions.left - dimensions.right

        return parseInt(Math.max((avWidth - (n - 1)*gap) / (n*seriesCount), 5))

      drawColumns: (svg, axes, data, columnWidth, handlers) ->
        data = data.filter (s) -> s.type is 'column'

        x1 = d3.scale.ordinal()
          .domain(data.map (s) -> s.name + s.index)
          .rangeBands([0, data.length * columnWidth], 0)

        colGroup = svg.select('.content').selectAll('.columnGroup')
          .data(data)
          .enter().append("g")
            .attr('class', (s) -> 'columnGroup ' + 'series_' + s.index)
            .style('fill', (s) -> s.color)
            .style('fill-opacity', 0.8)
            .attr('transform', (s) -> "translate(" + (x1(s.name + s.index) - data.length*columnWidth/2) + ",0)")
            .on('mouseover', (series) ->
              target = d3.select(d3.event.target)

              handlers.onMouseOver?(svg, {
                series: series
                x: target.attr('x')
                y: axes[series.axis + 'Scale'](target.datum().value)
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

# ----


# lib/utils/dots.coffee
      drawDots: (svg, axes, data, options, handlers) ->
        dotGroup = svg.select('.content').selectAll('.dotGroup')
          .data data.filter (s) -> s.type in ['line', 'area']
          .enter().append('g')
        dotGroup.attr(
            class: (s) -> "dotGroup series_#{s.index}"
            fill: (s) -> s.color
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
        if options.tooltipMode in ['dots', 'both', 'scrubber']
          dotGroup.on('mouseover', (series) ->
            target = d3.select(d3.event.target)
            target.attr('r', 4)

            handlers.onMouseOver?(svg, {
              series: series
              x: target.attr('cx')
              y: target.attr('cy')
              datum: target.datum()
            })
          )
          .on('mouseout', (d) ->
            d3.select(d3.event.target).attr('r', 2)
            handlers.onMouseOut?(svg)
          )

        return this

# ----


# lib/utils/legend.coffee
      computeLegendLayout: (series, dimensions) ->
        fn = (s) -> s.label || s.y

        layout = [0]
        leftSeries = series.filter (s) -> s.axis is 'y'
        i = 1
        while i < leftSeries.length
          layout.push @getTextWidth(fn(leftSeries[i - 1])) + layout[i - 1] + 40
          i++


        rightSeries = series.filter (s) -> s.axis is 'y2'
        return layout if rightSeries.length is 0

        w = dimensions.width - dimensions.right - dimensions.left

        rightLayout = [w - @getTextWidth(fn(rightSeries[rightSeries.length - 1]))]

        j = rightSeries.length - 2
        while j >= 0
          label = fn(rightSeries[j])
          rightLayout.push w - @getTextWidth(label) - (w - rightLayout[rightLayout.length - 1]) - 40
          j--

        rightLayout.reverse()

        return layout.concat(rightLayout)

      drawLegend: (svg, series, dimensions, handlers) ->
        layout = this.computeLegendLayout(series, dimensions)

        that = this
        legend = svg.append('g').attr('class', 'legend')

        d = 16
        svg.select('defs').append('svg:clipPath')
          .attr('id', 'legend-clip')
          .append('circle').attr('r', d/2)

        item = legend.selectAll('.legendItem')
          .data(series)

        item.enter().append('g')
            .attr(
              'class': (s, i) -> "legendItem series_#{i}"
              'transform': (s, i) -> "translate(#{layout[i]},#{dimensions.height-40})"
              'opacity': (s, i) ->
                if s.visible is false
                  that.toggleSeries(svg, i)
                  return '0.2'

                return '1'
            )

        item.on('click', (s, i) ->
          isNowVisible = that.toggleSeries(svg, i)

          d3.select(this).attr('opacity', if isNowVisible then '1' else '0.2')
          handlers.onSeriesVisibilityChange?({series: s, index: i, newVisibility: isNowVisible})
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
            'class': (d, i) -> "legendItem series_#{i}"
            'font-family': 'Courier'
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
        if options.tooltipMode in ['both', 'lines']
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
              y = scales.yScale(datum.value)
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
              if !minYValue? or datum.value < minYValue
                minYValue = datum.value
              if !maxYValue? or datum.value > maxYValue
                maxYValue = datum.value

            xPercentage = (mousePos[0] - minXPos) / (maxXPos - minXPos)
            yPercentage = (mousePos[1] - minYPos) / (maxYPos - minYPos)
            xVal = Math.round(xPercentage * (maxXValue - minXValue) + minXValue)
            yVal = Math.round((1 - yPercentage) * (maxYValue - minYValue) + minYValue)

            interpDatum = x: xVal, value: yVal

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

      createGlass: (svg, dimensions, handlers, axes, data) ->
        glass = svg.append('g')
          .attr(
            'class': 'glass-container'
            'opacity': 0
          )

        items = glass.selectAll('.scrubberItem')
          .data(data)
          .enter()
            .append('g')
              .attr(
                'class', (s, i) -> "scrubberItem series_#{i}"
              )

        items.append('circle')
          .attr(
            'class': (s, i) -> "scrubberDot series_#{i}"
            'fill': 'white'
            'stroke': (s) -> s.color
            'stroke-width': '2px'
            'r': 4
          )

        items.append('path')
          .attr(
            'class': (s, i) -> "scrubberPath series_#{i}"
            'y': '-7px'
            'fill': (s) -> s.color
          )

        items.append('text')
          .style('text-anchor', (s) -> return if s.axis is 'y' then 'end' else 'start')
          .attr(
            'class': (d, i) -> "scrubberText series_#{i}"
            'height': '14px'
            'font-family': 'Courier'
            'font-size': 10
            'fill': 'white'
            'transform': (s) ->
              return if s.axis is 'y' then 'translate(-7, 3)' else 'translate(7, 3)'
            'text-rendering': 'geometric-precision'
          )
          .text (s) -> s.label || s.y

        glass.append('rect')
          .attr(
            class: 'glass'
            width: dimensions.width - dimensions.left - dimensions.right
            height: dimensions.height - dimensions.top - dimensions.bottom
          )
          .style('fill', 'white')
          .style('fill-opacity', 0.000001)
          .on('mouseover', ->
            handlers.onChartHover(svg, d3.select(d3.event.target), axes, data)
          )

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
            lineMode: s.lineMode

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
          tooltipMode: 'dots'
          lineMode: 'linear'
          tension: 0.7
          axes: {
            x: {type: 'linear', key: 'x'}
            y: {type: 'linear'}
          }
          series: []
          drawLegend: true
          drawDots: true
        }

      sanitizeOptions: (options, mode) ->
        return this.getDefaultOptions() unless options?

        if mode is 'thumbnail'
          options.drawLegend = false
          options.drawDots = false
          options.tooltipMode = 'none'

        options.series = this.sanitizeSeriesOptions(options.series)

        options.axes = this.sanitizeAxes(options.axes, this.haveSecondYAxis(options.series))

        options.lineMode or= 'linear'
        options.tension = if /^\d+(\.\d+)?$/.test(options.tension) then options.tension else 0.7

        if options.tooltipMode not in ['none', 'dots', 'lines', 'both', 'scrubber']
          options.tooltipMode = 'dots'

        if options.tooltipMode is 'scrubber'
          options.drawLegend = true

        options.drawLegend = true unless options.drawLegend is false
        options.drawDots = true unless options.drawDots is false

        return options

      sanitizeSeriesOptions: (options) ->
        return [] unless options?

        colors = d3.scale.category10()
        options.forEach (s, i) ->
          s.axis = if s.axis?.toLowerCase() isnt 'y2' then 'y' else 'y2'
          s.color or= colors(i)
          s.type = if s.type in ['line', 'area', 'column'] then s.type else "line"

          if s.type is 'column'
            delete s.thickness
            delete s.lineMode
          else if not /^\d+px$/.test(s.thickness)
            s.thickness = '1px'

          if s.type in ['line', 'area'] and s.lineMode not in ['dashed']
            delete s.lineMode

        return options

      sanitizeAxes: (axesOptions, secondAxis) ->
        axesOptions = {} unless axesOptions?

        axesOptions.x = this.sanitizeAxisOptions(axesOptions.x)
        axesOptions.x.key or= "x"
        axesOptions.y = this.sanitizeAxisOptions(axesOptions.y)
        axesOptions.y2 = this.sanitizeAxisOptions(axesOptions.y2) if secondAxis

        this.sanitizeExtrema(axesOptions.y)
        this.sanitizeExtrema(axesOptions.y2) if secondAxis

        return axesOptions

      sanitizeExtrema: (options) ->
        min = this.getSanitizedExtremum(options.min)
        if min?
          options.min = min
        else
          delete options.min

        max = this.getSanitizedExtremum(options.max)
        if max?
          options.max = max
        else
          delete options.max



      getSanitizedExtremum: (value) ->
        return undefined unless value?

        number = parseInt(value, 10)

        if isNaN(number)
          $log.warn("Invalid extremum value : #{value}, deleting it.")
          return undefined

        return number


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

        y.clamp(true)
        y2.clamp(true)

        xAxis = d3.svg.axis().scale(x).orient('bottom').tickFormat(axesOptions.x.labelFunction)
        yAxis = d3.svg.axis().scale(y).orient('left').tickFormat(axesOptions.y.labelFunction)
        y2Axis = d3.svg.axis().scale(y2).orient('right').tickFormat(axesOptions.y2?.labelFunction)

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

      setScalesDomain: (scales, data, series, svg, axesOptions) ->
        this.setXScale(scales.xScale, data, series, axesOptions)

        yDomain = this.getVerticalDomain(axesOptions, data, series, 'y')
        y2Domain = this.getVerticalDomain(axesOptions, data, series, 'y2')

        scales.yScale.domain(yDomain).nice()
        scales.y2Scale.domain(y2Domain).nice()

        svg.selectAll('.x.axis').call(scales.xAxis)
        svg.selectAll('.y.axis').call(scales.yAxis)
        svg.selectAll('.y2.axis').call(scales.y2Axis)

      getVerticalDomain: (axesOptions, data, series, key) ->
        return [] unless o = axesOptions[key]

        domain = this.yExtent((series.filter (s) -> s.axis is key), data)
        if o.type is 'log'
          domain[0] = if domain[0] is 0 then 0.001 else domain[0]

        domain[0] = o.min if o.min?
        domain[1] = o.max if o.max?

        return domain

      yExtent: (series, data) ->
        minY = Number.POSITIVE_INFINITY
        maxY = Number.NEGATIVE_INFINITY

        series.forEach (s) ->
          minY = Math.min(minY, d3.min(data, (d) -> d[s.y]))
          maxY = Math.max(maxY, d3.max(data, (d) -> d[s.y]))

        if minY is maxY
          if minY > 0
            return [0, minY*2]
          else
            return [minY*2, 0]

        return [minY, maxY]

      setXScale: (xScale, data, series, axesOptions) ->
        xScale.domain(this.xExtent(data, axesOptions.x.key))

        if series.filter((s) -> s.type is 'column').length
          this.adjustXScaleForColumns(xScale, data, axesOptions.x.key)

      xExtent: (data, key) ->
        [from, to] = d3.extent(data, (d) -> d[key])

        if from is to
          if from > 0
            return [0, from*2]
          else
            return [from*2, 0]

        return [from, to]

      adjustXScaleForColumns: (xScale, data, field) ->
        step = this.getAverageStep(data, field)
        d = xScale.domain()
        if angular.isDate(d[0])
          xScale.domain([new Date(d[0].getTime() - step), new Date(d[1].getTime() + step)])
        else
          xScale.domain([d[0] - step, d[1] + step])

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


# lib/utils/tooltips.coffee
      getTooltipHandlers: (options) ->
        if options.tooltipMode is 'scrubber'
          return {
            onChartHover: angular.bind(this, this.showScrubber)
          }
        else
          return {
            onMouseOver: angular.bind(this, this.onMouseOver)
            onMouseOut: angular.bind(this, this.onMouseOut)
          }

      showScrubber: (svg, glass, axes, data) ->
        that = this
        glass.on('mousemove', ->
          svg.selectAll('.glass-container').attr('opacity', 1)
          that.updateScrubber(svg, d3.mouse(this), axes, data)
        )
        glass.on('mouseout', ->
          glass.on('mousemove', null)
          svg.selectAll('.glass-container').attr('opacity', 0)
        )

      updateScrubber: (svg, [x, y], axes, data) ->
        # Dichotomy FTW
        getClosest = (values, value) ->
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

        that = this
        data.forEach (series, index) ->
          v = getClosest(series.values, axes.xScale.invert(x))

          item = svg.select(".scrubberItem.series_#{index}")
          item.transition().duration(50)
            .attr('transform': "translate(#{axes.xScale(v.x)}, #{axes[v.axis + 'Scale'](v.value)})")

          item.select('text').text(v.value)

          item.select('path')
            .attr('d', (s) ->
              if s.axis is 'y2'
                return that.getY2TooltipPath(that.getTextWidth('' + v.value))
              else
                return that.getYTooltipPath(that.getTextWidth('' + v.value))
            )


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

      onMouseOver: (svg, event) ->
        this.updateXTooltip(svg, event)

        if event.series.axis is 'y2'
          this.updateY2Tooltip(svg, event)
        else
          this.updateYTooltip(svg, event)

      onMouseOut: (svg) ->
        this.hideTooltips(svg)

      updateXTooltip: (svg, event) ->
        xTooltip = svg.select("#xTooltip")
          .transition()
          .attr(
            'opacity': 1.0
            'transform': 'translate(' + event.x + ',0)'
          )

        textX = undefined
        if event.series.xFormatter?
          textX = '' + event.series.xFormatter(event.datum.x)
        else
          textX = '' + event.datum.x

        xTooltip.select('text').text(textX)
        xTooltip.select('path')
          .attr('fill', event.series.color)
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

      updateYTooltip: (svg, event) ->
        yTooltip = svg.select("#yTooltip")
          .transition()
          .attr(
            'opacity': 1.0
            'transform': 'translate(0, ' + event.y + ')'
          )

        textY = '' + event.datum.value
        w = this.getTextWidth(textY)
        yTooltipText = yTooltip.select('text').text(textY)

        yTooltipText.attr(
          'transform': 'translate(' + (- w - 2) + ',3)'
          'width': w
        )

        yTooltip.select('path')
          .attr('fill', event.series.color)
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

      updateY2Tooltip: (svg, event) ->
        y2Tooltip = svg.select("#y2Tooltip")
          .transition()
          .attr('opacity', 1.0)

        textY = '' + event.datum.value
        w = this.getTextWidth(textY)
        y2TooltipText = y2Tooltip.select('text').text(textY)
        y2TooltipText.attr(
          'transform': 'translate(7, ' + (parseFloat(event.y) + 3) + ')'
          'w': w
        )

        y2Tooltip.select('path')
          .attr(
            'fill': event.series.color
            'd': this.getY2TooltipPath(w)
            'transform': 'translate(0, ' + event.y + ')'
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
