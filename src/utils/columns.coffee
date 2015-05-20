      getPseudoColumns: (data, options) ->
        data = data.filter (s) -> s.type is 'column'

        pseudoColumns = {}
        keys = []
        data.forEach (series) ->
          inAStack = false
          options.stacks.forEach (stack, index) ->
            if series.id? and series.id in stack.series
              pseudoColumns[series.id] = index
              keys.push(index) unless index in keys
              inAStack = true

          if inAStack is false
            i = pseudoColumns[series.id] = index = keys.length
            keys.push(i)

        return {pseudoColumns, keys}

      getBestColumnWidth: (dimensions, seriesData, options) ->
        return 10 unless seriesData and seriesData.length isnt 0

        return 10 if (seriesData.filter (s) -> s.type is 'column').length is 0

        {pseudoColumns, keys} = this.getPseudoColumns(seriesData, options)

        # +2 because abscissas will be extended to one more row at each end
        n = seriesData[0].values.length + 2
        seriesCount = keys.length
        avWidth = dimensions.width - dimensions.left - dimensions.right

        return parseInt(Math.max((avWidth - (n - 1)*options.columnsHGap) / (n*seriesCount), 5))

      getColumnAxis: (data, columnWidth, options) ->
        {pseudoColumns, keys} = this.getPseudoColumns(data, options)

        x1 = d3.scale.ordinal()
          .domain(keys)
          .rangeBands([0, keys.length * columnWidth], 0)

        return (s) ->
          return 0 unless pseudoColumns[s.id]?
          index = pseudoColumns[s.id]
          return x1(index) - keys.length*columnWidth/2


      drawColumns: (svg, axes, data, columnWidth, options, handlers, dispatch) ->
        data = data.filter (s) -> s.type is 'column'

        x1 = this.getColumnAxis(data, columnWidth, options)

        data.forEach (s) -> s.xOffset = x1(s) + columnWidth*.5

        colGroup = svg.select('.content').selectAll('.columnGroup')
          .data(data)
          .enter().append("g")
            .attr('class', (s) -> 'columnGroup series_' + s.index)
            .attr('transform', (s) -> "translate(" + x1(s) + ",0)")

        colGroup.each (series) ->
          d3.select(this).selectAll("rect")
            .data(series.values)
            .enter().append("rect")
              .style({
                'stroke': series.color
                'fill': series.color
                'stroke-opacity': (d) -> if d.y is 0 then '0' else '1'
                'stroke-width': '1px'
                'fill-opacity': (d) -> if d.y is 0 then 0 else 0.7
              })
              .attr(
                width: columnWidth
                x: (d) -> axes.xScale(d.x)
                height: (d) ->
                  return axes[d.axis + 'Scale'].range()[0] if d.y is 0
                  return Math.abs(axes[d.axis + 'Scale'](d.y0 + d.y) - axes[d.axis + 'Scale'](d.y0))
                y: (d) ->
                  if d.y is 0 then 0 else axes[d.axis + 'Scale'](Math.max(0, d.y0 + d.y))
              )
              .on('click': (d, i) -> dispatch.click(d, i))
              .on('mouseover', (d, i) ->
                dispatch.hover(d, i)
                handlers.onMouseOver?(svg, {
                  series: series
                  x: axes.xScale(d.x)
                  y: axes[d.axis + 'Scale'](d.y0 + d.y)
                  datum: d
                }, options.axes)
              )
              .on('mouseout', (d) ->
                handlers.onMouseOut?(svg)
              )

        return this