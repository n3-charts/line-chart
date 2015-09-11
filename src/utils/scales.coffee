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

              if !!conditions.y
                svg.append('g')
                  .attr('class', 'y grid')
                svg.append('g')
                  .attr('class', 'y axis')
                  .call(yAxis)
                  .call(style)

              if createY2Axis and !!conditions.y2
                svg.append('g')
                  .attr('class', 'y2 grid')
                  .attr('transform', 'translate(' + width + ', 0)')
                svg.append('g')
                  .attr('class', 'y2 axis')
                  .attr('transform', 'translate(' + width + ', 0)')
                  .call(y2Axis)
                  .call(style)

              if !!conditions.x
                svg.append('g')
                  .attr('class', 'x grid')
                  .attr('transform', 'translate(0,' + height + ')')
                svg.append('g')
                  .attr('class', 'x axis')
                  .attr('transform', 'translate(0,' + height + ')')
                  .call(xAxis)
                  .call(style)

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
          .innerTickSize(4)
          .tickFormat(o?.ticksFormatter)

        return axis unless o?

        # ticks can be either an array of tick values
        if angular.isArray(o.ticks)
          axis.tickValues(o.ticks)
        
        # or a number of ticks (approximately)
        else if angular.isNumber(o.ticks)
          axis.ticks(o.ticks)
        
        # or a range function e.g. d3.time.minute
        else if angular.isFunction(o.ticks)
          axis.ticks(o.ticks, o.ticksInterval)

        return axis

      setDefaultStroke: (selection) ->
        selection
          .attr('stroke', '#000')
          .attr('stroke-width', 1)
          .style('shape-rendering', 'crispEdges')

      setDefaultGrid: (selection) ->
        selection
          .attr('stroke', '#eee')
          .attr('stroke-width', 1)
          .style('shape-rendering', 'crispEdges')

      setScalesDomain: (scales, data, series, svg, options) ->
        this.setXScale(scales.xScale, data, series, options.axes)

        axis = svg.selectAll('.x.axis')
          .call(scales.xAxis)

        if options.axes.x.innerTicks?
          axis.selectAll('.tick>line')
            .call(this.setDefaultStroke)

        if options.axes.x.grid?
          height = options.margin.height - options.margin.top - options.margin.bottom
          xGrid = scales.xAxis
            .tickSize(-height, 0, 0)
          grid = svg.selectAll('.x.grid')
            .call(xGrid)
          grid.selectAll('.tick>line')
            .call(this.setDefaultGrid)

        if options.axes.x.ticksRotate?
          axis.selectAll('.tick>text')
            .attr('dy', null)
            .attr('transform', 'translate(0,5) rotate(' + options.axes.x.ticksRotate + ' 0,6)')
            .style('text-anchor', if options.axes.x.ticksRotate >= 0 then 'start' else 'end')

        if (series.filter (s) -> s.axis is 'y' and s.visible isnt false).length > 0
          yDomain = this.getVerticalDomain(options, data, series, 'y')
          scales.yScale.domain(yDomain).nice()
          axis = svg.selectAll('.y.axis')
            .call(scales.yAxis)

          if options.axes.y.innerTicks?
            axis.selectAll('.tick>line')
              .call(this.setDefaultStroke)

          if options.axes.y.ticksRotate?
            axis.selectAll('.tick>text')
              .attr('transform', 'rotate(' + options.axes.y.ticksRotate + ' -6,0)')
              .style('text-anchor', 'end')

          if options.axes.y.grid?
            width = options.margin.width - options.margin.left - options.margin.right
            yGrid = scales.yAxis
              .tickSize(-width, 0, 0)
            grid = svg.selectAll('.y.grid')
              .call(yGrid)
            grid.selectAll('.tick>line')
              .call(this.setDefaultGrid)

        if (series.filter (s) -> s.axis is 'y2' and s.visible isnt false).length > 0
          y2Domain = this.getVerticalDomain(options, data, series, 'y2')
          scales.y2Scale.domain(y2Domain).nice()
          axis = svg.selectAll('.y2.axis')
            .call(scales.y2Axis)
          if options.axes.y2.innerTicks?
            axis.selectAll('.tick>line')
              .call(this.setDefaultStroke)
          
          if options.axes.y2.ticksRotate?
            axis.selectAll('.tick>text')
              .attr('transform', 'rotate(' + options.axes.y2.ticksRotate + ' 6,0)')
              .style('text-anchor', 'start')

          if options.axes.y2.grid?
            width = options.margin.width - options.margin.left - options.margin.right
            y2Grid = scales.y2Axis
              .tickSize(-width, 0, 0)
            grid = svg.selectAll('.y2.grid')
              .call(y2Grid)
            grid.selectAll('.tick>line')
              .call(this.setDefaultGrid)

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
        domain = this.xExtent(data, axesOptions.x.key, axesOptions.x.type)
        if series.filter((s) -> s.type is 'column').length
          this.adjustXDomainForColumns(domain, data, axesOptions.x.key)

        o = axesOptions.x
        domain[0] = o.min if o.min?
        domain[1] = o.max if o.max?

        xScale.domain(domain)

      xExtent: (data, key, type) ->
        [from, to] = d3.extent(data, (d) -> d[key])

        if from is to
          if type is 'date'
            # delta of 1 day
            delta = 24*60*60*1000
            return [new Date(+from - delta), new Date(+to + delta)]
          else
            return if from > 0 then [0, from*2] else [from*2, 0]

        return [from, to]

      adjustXDomainForColumns: (domain, data, field) ->
        step = this.getAverageStep(data, field)

        if angular.isDate(domain[0])
          domain[0] = new Date(+domain[0] - step)
          domain[1] = new Date(+domain[1] + step)
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
