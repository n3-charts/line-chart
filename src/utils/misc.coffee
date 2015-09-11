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
