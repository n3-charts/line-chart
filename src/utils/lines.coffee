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
