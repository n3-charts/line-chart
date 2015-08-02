      getEventDispatcher: () ->
        
        events = [
          'focus',
          'hover',
          'click',
          'toggle'
        ]

        return d3.dispatch.apply(this, events)

      setZoom: (svg, dimensions, axes, data, columnWidth, options, handlers, dispatch) ->
        self = this
        
        zoomListener = d3.behavior.zoom()
          .on("zoom", () ->
            svg.selectAll('.x.axis').call(axes.xAxis)
            if data.length
              columnWidth = self.getBestColumnWidth(axes, dimensions, data, options)
              self.drawData(svg, dimensions, axes, data, columnWidth, options, handlers, dispatch)
          )

        if options.axes.x.zoomable?
          zoomListener.x(axes.xScale)

        if options.axes.y.zoomable?
          zoomListener.y(axes.yScale)
        
        if options.axes.y2?.zoomable?
          zoomListener.y(axes.y2Scale)

        svg.call(zoomListener)