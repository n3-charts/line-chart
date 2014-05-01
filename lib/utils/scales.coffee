      createAxes: (svg, dimensions, axesOptions) ->
        drawY2Axis = axesOptions.y2?

        width = dimensions.width
        height = dimensions.height

        width = width - dimensions.left - dimensions.right
        height = height - dimensions.top - dimensions.bottom

        x = undefined
        if axesOptions.x.type is 'date'
          x = d3.time.scale().rangeRound([0, width])
        else
          x = d3.scale.linear().rangeRound([0, width])

        y = undefined
        if axesOptions.y.type is 'log'
          y = d3.scale.log().clamp(true).rangeRound([height, 0])
        else
          y = d3.scale.linear().rangeRound([height, 0])


        y2 = undefined
        if drawY2Axis and axesOptions.y2.type is 'log'
          y2 = d3.scale.log().clamp(true).rangeRound([height, 0])
        else
          y2 = d3.scale.linear().rangeRound([height, 0])

        xAxis = d3.svg.axis().scale(x).orient('bottom').tickFormat(axesOptions.x.labelFunction)
        yAxis = d3.svg.axis().scale(y).orient('left').tickFormat(axesOptions.y.labelFunction)
        y2Axis = d3.svg.axis().scale(y2).orient('right').tickFormat(axesOptions.y2?.labelFunction)

        style = (group) ->
          group.style(
            'font': '10px monospace'
            'shape-rendering': 'crispEdges'
          )

          group.selectAll('path').style(
            'fill': 'none'
            'stroke': '#000'
          )

        that = this

        return {
          xScale: x
          yScale: y
          y2Scale: y2
          xAxis: xAxis
          yAxis: yAxis
          y2Axis: y2Axis

          andAddThemIf: (condition) ->
            if not condition
              style(
                svg.append('g')
                  .attr('class', 'x axis')
                  .attr('transform', 'translate(0,' + height + ')')
                  .call(xAxis)
              )

              style(
                svg.append('g')
                  .attr('class', 'y axis')
                  .call(yAxis)
              )

              if drawY2Axis
                style(
                  svg.append('g')
                    .attr('class', 'y2 axis')
                    .attr('transform', 'translate(' + width + ', 0)')
                    .call(y2Axis)
                )

            return {
              xScale: x
              yScale: y
              y2Scale: y2
              xAxis: xAxis
              yAxis: yAxis
              y2Axis: y2Axis
            }
          }

      setScalesDomain: (scales, data, series, svg, axesOptions) ->
        this.setXScale(scales.xScale, data, series, axesOptions)

        ySeries = series.filter (s) -> s.axis isnt 'y2'
        y2Series = series.filter (s) -> s.axis is 'y2'

        yDomain = this.yExtent(ySeries, data)
        if axesOptions.y.type is 'log'
          yDomain[0] = if yDomain[0] is 0 then 0.001 else yDomain[0]

        y2Domain = this.yExtent(y2Series, data)
        if axesOptions.y2?.type is 'log'
          y2Domain[0] = if y2Domain[0] is 0 then 0.001 else y2Domain[0]

        scales.yScale.domain(yDomain).nice()
        scales.y2Scale.domain(y2Domain).nice()

        svg.selectAll('.x.axis').call(scales.xAxis)
        svg.selectAll('.y.axis').call(scales.yAxis)
        svg.selectAll('.y2.axis').call(scales.y2Axis)

      yExtent: (series, data) ->
        minY = Number.POSITIVE_INFINITY
        maxY = Number.NEGATIVE_INFINITY

        series.forEach (s) ->
          minY = Math.min(minY, d3.min(data, (d) -> d[s.y]))
          maxY = Math.max(maxY, d3.max(data, (d) -> d[s.y]))

        return [minY, maxY]

      setXScale: (xScale, data, series, axesOptions) ->
        xScale.domain(d3.extent(data, (d) -> d[axesOptions.x.key]))

        if series.filter((s) -> s.type is 'column').length
          this.adjustXScaleForColumns(xScale, data, axesOptions.x.key)

      adjustXScaleForColumns: (xScale, data, field) ->
        step = this.getAverageStep(data, field)
        d = xScale.domain()

        if angular.isDate(d[0])
          xScale.domain([new Date(d[0].getTime() - step), new Date(d[1].getTime() + step)])
        else
          xScale.domain([d[0] - step, d[1] + step])

      getAverageStep: (data, field) ->
        sum = 0
        n = data.length - 1
        i = 0
        while i < n
          sum += data[i + 1][field] - data[i][field]
          i++

        return sum/n

      haveSecondYAxis: (series) ->
        return !series.every (s) -> s.axis isnt 'y2'
