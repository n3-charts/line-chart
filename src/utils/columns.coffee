      getPseudoColumns: (data, options) ->
        data = data.filter (s) -> s.type is 'column'

        pseudoColumns = {}
        keys = []
        data.forEach (series) ->
          i = options.series.map((d) -> d.id).indexOf(series.id)
          visible = options.series?[i].visible
          if visible is undefined or visible is not false
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

      getMinDelta: (seriesData, key, scale, range) ->
        return d3.min(
          # Compute the minimum difference along an axis on all series
          seriesData.map (series) ->
            # Compute delta
            return series.values
              # Look at all scaled values on the axis
              .map((d) -> scale(d[key]))
              # Select only columns in the visible range
              .filter((e) ->
                return if range then e >= range[0] && e <= range[1] else true
              )
              # Return the smallest difference between 2 values
              .reduce((prev, cur, i, arr) ->
                # Get the difference from the current value
                # with the previous value in the array
                diff = if i > 0 then Math.max(cur - arr[i - 1], 0) else Number.MAX_VALUE
                # Return the new difference if it is smaller
                # than the previous difference
                return if diff < prev then diff else prev
              , Number.MAX_VALUE)
        )

      getBestColumnWidth: (axes, dimensions, seriesData, options) ->
        return 10 unless seriesData and seriesData.length isnt 0

        return 10 if (seriesData.filter (s) -> s.type is 'column').length is 0

        {pseudoColumns, keys} = this.getPseudoColumns(seriesData, options)

        # inner width of the chart area
        innerWidth = dimensions.width - dimensions.left - dimensions.right

        colData = seriesData
          # Get column data (= columns that are not stacked)
          .filter((d) ->
            return pseudoColumns.hasOwnProperty(d.id)
          )

        # Get the smallest difference on the x axis in the visible range
        delta = this.getMinDelta(colData, 'x', axes.xScale, [0, innerWidth])
        
        # We get a big value when we cannot compute the difference
        if delta > innerWidth
          # Set to some good looking ordinary value
          delta = 0.25 * innerWidth

        # number of series to display
        nSeries = keys.length

        return if options.columnsHGap < delta \
          then Math.max(1.0, (delta - options.columnsHGap) / nSeries) \
          else Math.max(1.0, delta*0.8 / nSeries)

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

        # filter the data to retrieve only series of type column
        data = data.filter (s) -> s.type is 'column'

        x1 = this.getColumnAxis(data, columnWidth, options)

        data.forEach (s) -> s.xOffset = x1(s) + columnWidth*.5

        colJoin = svg.select('.content').selectAll('.columnGroup')
          .data(data)

        colGroup = colJoin.enter().append("g")
            .attr('class', (s) -> 'columnGroup series_' + s.index)
        
        colJoin.attr('transform', (s) -> "translate(" + x1(s) + ",0)")

        colJoin.each (series) ->
          # only draw visible series to avoid with="NaN" errors
          i = options.series.map((d) -> d.id).indexOf(series.id)
          visible = options.series?[i].visible
          if visible is undefined or visible is not false
            dataJoin = d3.select(this).selectAll("rect")
              .data(series.values)
            
            dataJoin.enter()
              .append("rect")
              .on('click': (d, i) -> dispatch.click(d, i, series))
              .on('mouseenter', (d, i) -> dispatch.mouseenter(d, i, series))
              .on('mouseover', (d, i) ->
                handlers.onMouseOver?(svg, {
                  series: series
                  x: axes.xScale(d.x)
                  y: axes[d.axis + 'Scale'](d.y0 + d.y)
                  datum: d
                }, options.axes)
                dispatch.hover(d, i, series)
                dispatch.mouseover(d, i, series)
              )
              .on('mouseout', (d, i) ->
                handlers.onMouseOut?(svg)
                dispatch.mouseout(d, i, series)
              )

            dataJoin.style({
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

        return this