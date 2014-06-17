      getBestColumnWidth: (dimensions, seriesData) ->
        return 10 unless seriesData and seriesData.length isnt 0

        # +2 because abscissas will be extended to one more row at each end
        n = seriesData[0].values.length + 2
        seriesCount = seriesData.length
        gap = 0 # space between two rows
        avWidth = dimensions.width - dimensions.left - dimensions.right

        return parseInt(Math.max((avWidth - (n - 1)*gap) / (n*seriesCount), 5))

      drawColumns: (svg, axes, data, columnWidth, handlers) ->
        data = data.filter (s) -> s.type is 'column'

        x1 = d3.scale.ordinal()
          .domain(data.map (s) -> s.name + s.index)
          .rangeBands([0, data.length * columnWidth], 0)

        colGroup = svg.select('.content').selectAll('.columnGroup')
          .data(data)
          .enter().append("g")
            .attr('class', (s) -> 'columnGroup ' + 'series_' + s.index)
            .style('fill', (s) -> s.color)
            .style('fill-opacity', 0.8)
            .attr('transform', (s) -> "translate(" + (x1(s.name + s.index) - data.length*columnWidth/2) + ",0)")
            .on('mouseover', (series) ->
              target = d3.select(d3.event.target)

              handlers.onMouseOver?(svg, {
                series: series
                x: target.attr('x')
                y: axes[series.axis + 'Scale'](target.datum().value)
                datum: target.datum()
              })
            )
            .on('mouseout', (d) ->
              d3.select(d3.event.target).attr('r', 2)
              handlers.onMouseOut?(svg)
            )

        colGroup.selectAll("rect")
          .data (d) -> d.values
          .enter().append("rect")
            .style("fill-opacity", (d) -> if d.value is 0 then 0 else 1)

            .attr(
              width: columnWidth
              x: (d) -> axes.xScale(d.x)
              height: (d) ->
                return axes[d.axis + 'Scale'].range()[0] if d.value is 0
                return Math.abs(axes[d.axis + 'Scale'](d.value) - axes[d.axis + 'Scale'](0))
              y: (d) ->
                if d.value is 0 then 0 else axes[d.axis + 'Scale'](Math.max(0, d.value))
            )

        return this
