      drawDots: (svg, axes, data) ->
        that = this

        svg.select('.content').selectAll('.dotGroup')
          .data data.filter (s) -> s.type in ['line', 'area']
          .enter().append('g')
            .attr(
              class: (s) -> "dotGroup series_#{s.index}"
              fill: (s) -> s.color
            )
            .on('mouseover', (series) ->
              target = d3.select(d3.event.target)
              target.attr('r', 4)

              that.onMouseOver(svg, {
                series: series
                x: target.attr('cx')
                y: target.attr('cy')
                datum: target.datum()
              })
            )
            .on('mouseout', (d) ->
              d3.select(d3.event.target).attr('r', 2)
              that.onMouseOut(svg)
            )
            .selectAll('.dot').data (d) -> d.values
              .enter().append('circle')
              .attr(
                'class': 'dot'
                'r': 2
                'cx': (d) -> axes.xScale(d.x)
                'cy': (d) -> axes[d.axis + 'Scale'](d.value)
              )
              .style(
                'stroke': 'white'
                'stroke-width': '2px'
              )

        return this

      updateDots: (svg, scales) ->
        svg.select('.content').selectAll('.dotGroup').selectAll('.dot')
          .attr(
            'cx': (d) -> scales.xScale(d.x)
            'cy': (d) -> scales[d.axis + 'Scale'](d.value)
          )

        return this
