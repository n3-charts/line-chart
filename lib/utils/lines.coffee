      drawLines: (svg, scales, data, options) ->
        drawers =
          y: this.createLeftLineDrawer(scales, options.lineMode, options.tension)
          y2: this.createRightLineDrawer(scales, options.lineMode, options.tension)

        svg.select('.content').selectAll('.lineGroup')
          .data data.filter (s) -> s.type in ['line', 'area']
          .enter().append('g')
            .style('stroke', (s) -> s.color)
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
