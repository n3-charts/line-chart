      drawDots: (svg, axes, data, options, handlers, dispatch) ->
        dotJoin = svg.select('.content').selectAll('.dotGroup')
          .data(data.filter (s) -> s.type in ['line', 'area'] and s.drawDots)
        
        dotGroup = dotJoin.enter()
          .append('g')
          .attr('class', (s) -> "dotGroup series_#{s.index}")
        
        dotJoin.attr('fill', (s) -> s.color)

        dotJoin.each (series) ->

          dataJoin = d3.select(this).selectAll('.dot')
            .data(series.values)

          dataJoin.enter().append('circle')
            .attr('class', 'dot')
            .on('click': (d, i) -> dispatch.click(d, i, series))
            .on('mouseenter': (d, i) -> dispatch.mouseenter(d, i, series))
            .on('mouseover': (d, i) ->
              dispatch.hover(d, i, series)
              dispatch.mouseover(d, i, series)
            )
            .on('mouseout': (d, i) -> dispatch.mouseout(d, i, series))
          
          dataJoin.attr(
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
            d = target.datum()
            target.attr('r', (s) -> s.dotSize + 2)

            handlers.onMouseOver?(svg, {
              series: series
              x: target.attr('cx')
              y: target.attr('cy')
              datum: d
            }, options.axes)
          )
          .on('mouseout', (d) ->
            d3.select(d3.event.target).attr('r', (s) -> s.dotSize)
            handlers.onMouseOut?(svg)
          )

        return this
