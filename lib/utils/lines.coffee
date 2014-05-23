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
          lineGroup.on 'mouseover', (series) ->
            target = d3.select(d3.event.target)
            mousePos = d3.mouse(this)
            # interpolate between two closest data points
            valuesData = target.datum().values
            for datum in valuesData
              x = scales.xScale(datum.x)
              y = scales.yScale(datum.value)
              if x < mousePos[0]
                lastX = x
                lastY = y
                lastDatum = datum
              else
                # figure out how far along the line we are
                xPercentage = (mousePos[0] - lastX) / (x - lastX)
                xVal = Math.round(lastDatum.x + xPercentage * (datum.x - lastDatum.x))
                yVal = Math.round(lastDatum.value + xPercentage * (datum.value - lastDatum.value))
                interpDatum = x: xVal, value: yVal
                break

            that.onMouseOver(svg, {
              series: series
              x: mousePos[0]
              y: mousePos[1]
              datum: interpDatum
            })
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
