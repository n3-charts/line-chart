      getDefaultOptions: ->
        return {
          tooltip: {mode: 'scrubber'}
          lineMode: 'linear'
          tension: 0.7
          axes: {
            x: {type: 'linear', key: 'x'}
            y: {type: 'linear'}
          }
          series: []
          drawLegend: true
          drawDots: true
          stacks: []
          columnsHGap: 5
        }

      sanitizeOptions: (options, mode) ->
        return this.getDefaultOptions() unless options?

        if mode is 'thumbnail'
          options.drawLegend = false
          options.drawDots = false
          options.tooltip = {mode: 'none', interpolate: false}

        options.series = this.sanitizeSeriesOptions(options.series)
        options.stacks = this.sanitizeSeriesStacks(options.stacks, options.series)

        options.axes = this.sanitizeAxes(options.axes, this.haveSecondYAxis(options.series))

        options.lineMode or= 'linear'
        options.tension = if /^\d+(\.\d+)?$/.test(options.tension) then options.tension else 0.7

        this.sanitizeTooltip(options)

        options.drawLegend = options.drawLegend isnt false
        options.drawDots = options.drawDots isnt false

        options.columnsHGap = 5 unless angular.isNumber(options.columnsHGap)

        return options

      sanitizeSeriesStacks: (stacks, series) ->
        return [] unless stacks?

        seriesKeys = {}
        series.forEach (s) -> seriesKeys[s.id] = s

        stacks.forEach (stack) ->
          stack.series.forEach (id) ->
            s = seriesKeys[id]
            if s?
              $log.warn "Series #{id} is not on the same axis as its stack" unless s.axis is stack.axis
            else
              $log.warn "Unknown series found in stack : #{id}" unless s

        return stacks

      sanitizeTooltip: (options) ->
        if !options.tooltip
          options.tooltip = {mode: 'scrubber'}
          return

        if options.tooltip.mode not in ['none', 'axes', 'scrubber']
          options.tooltip.mode = 'scrubber'

        if options.tooltip.mode is 'scrubber'
          delete options.tooltip.interpolate
        else
          options.tooltip.interpolate = !!options.tooltip.interpolate

        if options.tooltip.mode is 'scrubber' and options.tooltip.interpolate
          throw new Error('Interpolation is not supported for scrubber tooltip mode.')

      sanitizeSeriesOptions: (options) ->
        return [] unless options?

        colors = d3.scale.category10()
        knownIds = {}
        options.forEach (s, i) ->
          if knownIds[s.id]?
            throw new Error("Twice the same ID (#{s.id}) ? Really ?")
          knownIds[s.id] = s if s.id?

        options.forEach (s, i) ->
          s.axis = if s.axis?.toLowerCase() isnt 'y2' then 'y' else 'y2'
          s.color or= colors(i)
          s.type = if s.type in ['line', 'area', 'column'] then s.type else "line"

          if s.type is 'column'
            delete s.thickness
            delete s.lineMode
            delete s.drawDots
            delete s.dotSize
          else if not /^\d+px$/.test(s.thickness)
            s.thickness = '1px'

          if s.type in ['line', 'area']
            if s.lineMode not in ['dashed']
              delete s.lineMode

            if s.drawDots isnt false and !s.dotSize?
              s.dotSize = 2

          if !s.id?
            cnt = 0
            while knownIds["series_#{cnt}"]?
              cnt++
            s.id = "series_#{cnt}"
            knownIds[s.id] = s

          if s.drawDots is false
            delete s.dotSize

        return options

      sanitizeAxes: (axesOptions, secondAxis) ->
        axesOptions = {} unless axesOptions?

        axesOptions.x = this.sanitizeAxisOptions(axesOptions.x)
        axesOptions.x.key or= "x"

        axesOptions.y = this.sanitizeAxisOptions(axesOptions.y)
        axesOptions.y2 = this.sanitizeAxisOptions(axesOptions.y2) if secondAxis

        return axesOptions

      sanitizeExtrema: (options) ->
        min = this.getSanitizedNumber(options.min)
        if min?
          options.min = min
        else
          delete options.min

        max = this.getSanitizedNumber(options.max)
        if max?
          options.max = max
        else
          delete options.max

      getSanitizedNumber: (value) ->
        return undefined unless value?

        number = parseInt(value, 10)

        if isNaN(number)
          $log.warn("Invalid extremum value : #{value}, deleting it.")
          return undefined

        return number

      sanitizeAxisOptions: (options) ->
        return {type: 'linear'} unless options?

        options.type or= 'linear'

        this.sanitizeExtrema(options)

        return options
