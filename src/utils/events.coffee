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
