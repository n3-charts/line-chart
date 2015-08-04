      getEventDispatcher: () ->
        
        events = [
          'focus',
          'hover',
          'click',
          'toggle'
        ]

        return d3.dispatch.apply(this, events)

      resetZoom: (svg, dimensions, axes, data, columnWidth, options, handlers, dispatch, zoom) ->
        zoom.scale(1)
        zoom.translate([0, 0])

        if options.axes.x.zoomable?
          svg.selectAll('.x.axis').call(axes.xAxis)

        if options.axes.y.zoomable?
          svg.selectAll('.y.axis').call(axes.yAxis)

        if options.axes.y2?.zoomable?
          svg.selectAll('.y2.axis').call(axes.y2Axis)

        if data.length
          columnWidth = this.getBestColumnWidth(axes, dimensions, data, options)
          this.drawData(svg, dimensions, axes, data, columnWidth, options, handlers, dispatch)

      setZoom: (svg, dimensions, axes, data, columnWidth, options, handlers, dispatch) ->
        self = this
        
        zoomHandler = () ->
            zoomed = false

            if options.axes.x.zoomable?
              svg.selectAll('.x.axis').call(axes.xAxis)
              zoomed = true

            if options.axes.y.zoomable?
              svg.selectAll('.y.axis').call(axes.yAxis)
              zoomed = true

            if options.axes.y2?.zoomable?
              svg.selectAll('.y2.axis').call(axes.y2Axis)
              zoomed = true

            if data.length
              columnWidth = self.getBestColumnWidth(axes, dimensions, data, options)
              self.drawData(svg, dimensions, axes, data, columnWidth, options, handlers, dispatch)

            if zoomed
              self.createZoomResetIcon(svg, dimensions, axes, data, columnWidth, options, handlers, dispatch, zoom)

        zoom = this.getZoomListener(axes, options, zoomHandler)
        svg.call(zoom)

      getZoomListener: (axes, options, zoomHandler) ->

        zoomListener = d3.behavior.zoom()

        if zoomHandler?
          zoomListener.on("zoom", zoomHandler)

        if options.axes.x?.zoomable?
          zoomListener.x(axes.xScale)

        if options.axes.y?.zoomable?
          zoomListener.y(axes.yScale)
        
        if options.axes.y2?.zoomable?
          zoomListener.y(axes.y2Scale)

        return zoomListener