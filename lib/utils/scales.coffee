      createAxes: (svg, dimensions, axesOptions) ->
        getDefaultStyle = this.getDefaultAxisStyle
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

        y.clamp(true)
        y2.clamp(true)

        xAxis = d3.svg.axis().scale(x).orient('bottom').tickFormat(axesOptions.x.labelFunction)
        yAxis = d3.svg.axis().scale(y).orient('left').tickFormat(axesOptions.y.labelFunction)
        y2Axis = d3.svg.axis().scale(y2).orient('right').tickFormat(axesOptions.y2?.labelFunction)

         
        style = (group, s) ->
          safestyle = getDefaultStyle()
          angular.extend( safestyle, s )
          group.style(
            'font': safestyle.labelSize + ' ' + safestyle.labelFontFamily
            'shape-rendering': 'crispEdges'
            'fill': safestyle.labelColor
          )

          group.selectAll('path').style(
            'fill': 'none'
            'stroke': safestyle.lineColor
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
                  .call(xAxis), axesOptions.x)

              style(
                svg.append('g')
                  .attr('class', 'y axis')
                  .call(yAxis), axesOptions.y)

              if drawY2Axis
                style(
                  svg.append('g')
                    .attr('class', 'y2 axis')
                    .attr('transform', 'translate(' + width + ', 0)')
                    .call(y2Axis), axesOptions.y2)

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

        yDomain = this.getVerticalDomain(axesOptions, data, series, 'y')
        y2Domain = this.getVerticalDomain(axesOptions, data, series, 'y2')

        scales.yScale.domain(yDomain).nice()
        scales.y2Scale.domain(y2Domain).nice()

        svg.selectAll('.x.axis').call(scales.xAxis)
        svg.selectAll('.y.axis').call(scales.yAxis)
        svg.selectAll('.y2.axis').call(scales.y2Axis)

      getVerticalDomain: (axesOptions, data, series, key) ->
        return [] unless o = axesOptions[key]

        domain = this.yExtent((series.filter (s) -> s.axis is key), data)
        if o.type is 'log'
          domain[0] = if domain[0] is 0 then 0.001 else domain[0]

        domain[0] = o.min if o.min?
        domain[1] = o.max if o.max?

        return domain

      yExtent: (series, data) ->
        minY = Number.POSITIVE_INFINITY
        maxY = Number.NEGATIVE_INFINITY

        series.forEach (s) ->
          minY = Math.min(minY, d3.min(data, (d) -> d[s.y]))
          maxY = Math.max(maxY, d3.max(data, (d) -> d[s.y]))

        if minY is maxY
          if minY > 0
            return [0, minY*2]
          else
            return [minY*2, 0]

        return [minY, maxY]

      setXScale: (xScale, data, series, axesOptions) ->
        xScale.domain(this.xExtent(data, axesOptions.x.key))

        if series.filter((s) -> s.type is 'column').length
          this.adjustXScaleForColumns(xScale, data, axesOptions.x.key)

      xExtent: (data, key) ->
        [from, to] = d3.extent(data, (d) -> d[key])

        if from is to
          if from > 0
            return [0, from*2]
          else
            return [from*2, 0]

        return [from, to]

      adjustXScaleForColumns: (xScale, data, field) ->
        step = this.getAverageStep(data, field)
        d = xScale.domain()
        if angular.isDate(d[0])
          xScale.domain([new Date(d[0].getTime() - step), new Date(d[1].getTime() + step)])
        else
          xScale.domain([d[0] - step, d[1] + step])

      getAverageStep: (data, field) ->
        return 0 unless data.length > 1
        sum = 0
        n = data.length - 1
        i = 0
        while i < n
          sum += data[i + 1][field] - data[i][field]
          i++

        return sum/n

      haveSecondYAxis: (series) ->
        return !series.every (s) -> s.axis isnt 'y2'
