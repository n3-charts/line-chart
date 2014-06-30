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

      createGlass: (svg, dimensions, handlers, axes, data, options) ->
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
            handlers.onChartHover(svg, d3.select(d3.event.target), axes, data, options)
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

      adjustMargins: (svg, dimensions, options, data) ->
        this.resetMargins(dimensions)
        return unless data and data.length
        return unless options.series.length

        dimensions.left = this.getWidestTickWidth(svg, 'y')
        dimensions.right = this.getWidestTickWidth(svg, 'y2')

        return if options.tooltip.mode is 'scrubber'

        series = options.series

        leftSeries = series.filter (s) -> s.axis isnt 'y2'
        leftWidest = this.getWidestOrdinate(data, leftSeries)
        dimensions.left = this.estimateSideTooltipWidth(svg, leftWidest).width + 20

        rightSeries = series.filter (s) -> s.axis is 'y2'
        return unless rightSeries.length

        rightWidest = this.getWidestOrdinate(data, rightSeries)
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

      getWidestOrdinate: (data, series) ->
        widest = ''

        data.forEach (row) ->
          series.forEach (series) ->
            return unless row[series.y]?

            if ('' + row[series.y]).length > ('' + widest).length
              widest = row[series.y]

        return widest
