      drawDots: (svg, axes, data, options, handlers) ->
        dotGroup = svg.select('.content').selectAll('.dotGroup')
          .data data.filter (s) -> s.type in ['line', 'area'] and s.drawDots
          .enter().append('g')
        dotGroup.attr(
            class: (s) -> "dotGroup series_#{s.index}"
            fill: (s) -> s.color
          )
          .selectAll('.dot').data (d) -> d.values
            .enter().append('circle')
            .attr(
              'class': 'dot'
              'r': (d) -> d.dotSize
              'cx': (d) -> axes.xScale(d.x)
              'cy': (d) -> axes[d.axis + 'Scale'](d.y + d.y0)
            )
            .style(
              'stroke': 'white'
              'stroke-width': '2px'
            )

        if options.tooltip.mode isnt 'none'
          dotGroup.on('mouseover', (series) ->
            target = d3.select(d3.event.target)
            target.attr('r', (s) -> s.dotSize + 2)

            handlers.onMouseOver?(svg, {
              series: series
              x: target.attr('cx')
              y: target.attr('cy')
              datum: target.datum()
            })
          )
          .on('mouseout', (d) ->
            d3.select(d3.event.target).attr('r', (s) -> s.dotSize)
            handlers.onMouseOut?(svg)
          )

        return this
