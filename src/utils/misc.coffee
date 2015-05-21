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

      estimateSideTooltipWidth: (svg, text) ->
        t = svg.append('text')
        t.text('' + text)
        this.styleTooltip(t)

        bbox = this.getTextBBox(t[0][0])
        t.remove()

        return bbox

      getTextBBox: (svgTextElement) ->
        return if svgTextElement isnt null then svgTextElement.getBBox() else {}

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
