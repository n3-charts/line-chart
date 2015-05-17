      createAxes: (svg, dimensions, axesOptions) ->
        createY2Axis = axesOptions.y2?

        width = dimensions.width
        height = dimensions.height

        width = width - dimensions.left - dimensions.right
        height = height - dimensions.top - dimensions.bottom

        x = undefined
        if axesOptions.x.type is 'date'
          x = d3.time.scale().rangeRound([0, width])
        else
          x = d3.scale.linear().rangeRound([0, width])
        xAxis = this.createAxis(x, 'x', axesOptions)

        y = undefined
        if axesOptions.y.type is 'log'
          y = d3.scale.log().clamp(true).rangeRound([height, 0])
        else
          y = d3.scale.linear().rangeRound([height, 0])
        y.clamp(true)
        yAxis = this.createAxis(y, 'y', axesOptions)

        y2 = undefined
        if createY2Axis and axesOptions.y2.type is 'log'
          y2 = d3.scale.log().clamp(true).rangeRound([height, 0])
        else
          y2 = d3.scale.linear().rangeRound([height, 0])
        y2.clamp(true)
        y2Axis = this.createAxis(y2, 'y2', axesOptions)


        style = (group) ->
          group.style(
            'font': '10px Courier'
            'shape-rendering': 'crispEdges'
          )

          group.selectAll('path').style(
            'fill': 'none'
            'stroke': '#000'
          )

        return {
          xScale: x
          yScale: y
          y2Scale: y2
          xAxis: xAxis
          yAxis: yAxis
          y2Axis: y2Axis

          andAddThemIf: (conditions) ->
            if !!conditions.all

              if !!conditions.x
                style(
                  svg.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', 'translate(0,' + height + ')')
                    .call(xAxis)
                )

              if !!conditions.y
                style(
                  svg.append('g')
                    .attr('class', 'y axis')
                    .call(yAxis)
                )

              if createY2Axis and !!conditions.y2
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

      createAxis: (scale, key, options) ->
        sides =
          x: 'bottom'
          y: 'left'
          y2: 'right'

        o = options[key]

        axis = d3.svg.axis()
          .scale(scale)
          .orient(sides[key])
          .tickFormat(o?.ticksFormatter)

        return axis unless o?

        axis.ticks(o.ticks) if angular.isNumber(o.ticks)
        axis.tickValues(o.ticks) if angular.isArray(o.ticks)

        return axis

      setScalesDomain: (scales, data, series, svg, options) ->
        this.setXScale(scales.xScale, data, series, options.axes)

        svg.selectAll('.x.axis').call(scales.xAxis)

        if (series.filter (s) -> s.axis is 'y' and s.visible isnt false).length > 0
          yDomain = this.getVerticalDomain(options, data, series, 'y')
          scales.yScale.domain(yDomain).nice()
          svg.selectAll('.y.axis').call(scales.yAxis)

        if (series.filter (s) -> s.axis is 'y2' and s.visible isnt false).length > 0
          y2Domain = this.getVerticalDomain(options, data, series, 'y2')
          scales.y2Scale.domain(y2Domain).nice()
          svg.selectAll('.y2.axis').call(scales.y2Axis)


      getVerticalDomain: (options, data, series, key) ->
        return [] unless o = options.axes[key]

        if o.ticks? and angular.isArray(o.ticks)
          return [o.ticks[0], o.ticks[o.ticks.length - 1]]

        mySeries = series.filter (s) -> s.axis is key and s.visible isnt false

        domain = this.yExtent(
          series.filter (s) -> s.axis is key and s.visible isnt false
          data
          options.stacks.filter (stack) -> stack.axis is key
        )
        if o.type is 'log'
          domain[0] = if domain[0] is 0 then 0.001 else domain[0]

        domain[0] = o.min if o.min?
        domain[1] = o.max if o.max?

        return domain

      yExtent: (series, data, stacks) ->
        minY = Number.POSITIVE_INFINITY
        maxY = Number.NEGATIVE_INFINITY

        groups = []
        stacks.forEach (stack) ->
          groups.push stack.series.map (id) -> (series.filter (s) -> s.id is id)[0]

        series.forEach (series, i) ->
          isInStack = false

          stacks.forEach (stack) ->
            if series.id in stack.series
              isInStack = true

          groups.push([series]) unless isInStack

        groups.forEach (group) ->
          group = group.filter(Boolean)
          minY = Math.min(minY, d3.min(data, (d) ->
            group.reduce ((a, s) -> Math.min(a, d[s.y]) ), Number.POSITIVE_INFINITY
          ))
          maxY = Math.max(maxY, d3.max(data, (d) ->
            group.reduce ((a, s) -> a + d[s.y]), 0
          ))

        if minY is maxY
          if minY > 0
            return [0, minY*2]
          else
            return [minY*2, 0]

        return [minY, maxY]

      setXScale: (xScale, data, series, axesOptions) ->
        domain = this.xExtent(data, axesOptions.x.key)
        if series.filter((s) -> s.type is 'column').length
          this.adjustXDomainForColumns(domain, data, axesOptions.x.key)

        o = axesOptions.x
        domain[0] = o.min if o.min?
        domain[1] = o.max if o.max?

        xScale.domain(domain)

      xExtent: (data, key) ->
        [from, to] = d3.extent(data, (d) -> d[key])

        if from is to
          if from > 0
            return [0, from*2]
          else
            return [from*2, 0]

        return [from, to]

      adjustXDomainForColumns: (domain, data, field) ->
        step = this.getAverageStep(data, field)

        if angular.isDate(domain[0])
          domain[0] = new Date(domain[0].getTime() - step)
          domain[1] = new Date(domain[1].getTime() + step)
        else
          domain[0] = domain[0] - step
          domain[1] = domain[1] + step

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
