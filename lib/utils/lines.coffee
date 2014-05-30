      drawLines: (svg, scales, data, options) ->
        that = this
        
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
          )
        if options.addLineTooltips
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

            that.onMouseOver(svg, {
              series: series
              x: mousePos[0]
              y: mousePos[1]
              datum: interpDatum
            })
          lineGroup.on 'mousemove', interpolateData
          .on 'mouseout', (d) ->
            that.onMouseOut(svg)

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
