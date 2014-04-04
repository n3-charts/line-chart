      getPixelCssProp: (element, propertyName) ->
        string = $window.getComputedStyle(element, null)
          .getPropertyValue(propertyName)
        return +string.replace(/px$/, '')

      getDefaultMargins: ->
        return {top: 20, right: 50, bottom: 60, left: 50}

      clean: (element) ->
        d3.select(element)
          .on('keydown', null)
          .on('keyup', null)
          .select('svg')
            .remove()

      bootstrap: (element, dimensions) ->
        d3.select(element).classed('chart', true)

        width = dimensions.width
        height = dimensions.height

        svg = d3.select(element).append('svg')
          .attr(
            width: width
            height: height
          )
          .append('g')
            .attr('transform', 'translate(' + dimensions.left + ',' + dimensions.top + ')')

        svg.append('defs')
          .attr('class', 'patterns')

        return svg

      createContent: (svg) ->
        svg.append('g').attr('class', 'content')

      getDataPerSeries: (data, options) ->
        series = options.series
        axes = options.axes

        return [] unless series and series.length and data and data.length

        straightenedData = []

        series.forEach (s) ->
          seriesData =
            xFormatter: axes.x.tooltipFormatter
            index: straightenedData.length
            name: s.y
            values: []
            striped: if s.striped is true then true else undefined
            color: s.color
            axis: s.axis || 'y'
            type: s.type
            thickness: s.thickness

          data.filter((row) -> row[s.y]?).forEach (row) ->
            seriesData.values.push(
              x: row[options.axes.x.key]
              value: row[s.y]
              axis: s.axis || 'y'
            )

          straightenedData.push(seriesData)

        return straightenedData

      resetMargins: (dimensions) ->
        defaults = this.getDefaultMargins()

        dimensions.left = defaults.left
        dimensions.right = defaults.right
        dimensions.top = defaults.top
        dimensions.bottom = defaults.bottom

      adjustMargins: (dimensions, options, data) ->
        this.resetMargins(dimensions)

        return unless data and data.length

        series = options.series

        leftSeries = series.filter (s) -> s.axis isnt 'y2'
        leftWidest = this.getWidestOrdinate(data, leftSeries)
        dimensions.left = this.getTextWidth('' + leftWidest) + 20

        rightSeries = series.filter (s) -> s.axis is 'y2'
        return unless rightSeries.length

        rightWidest = this.getWidestOrdinate(data, rightSeries)
        dimensions.right = this.getTextWidth('' + rightWidest) + 20

      adjustMarginsForThumbnail: (dimensions, axes) ->
        dimensions.top = 1
        dimensions.bottom = 2
        dimensions.left = 0
        dimensions.right = 1

      getTextWidth: (text) ->
        # return Math.max(25, text.length*6.7);
        return parseInt(text.length*5) + 10

      getWidestOrdinate: (data, series) ->
        widest = ''

        data.forEach (row) ->
          series.forEach (series) ->
            return unless row[series.y]?

            if ('' + row[series.y]).length > ('' + widest).length
              widest = row[series.y]

        return widest
