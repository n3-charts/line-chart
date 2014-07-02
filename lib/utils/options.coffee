      getDefaultOptions: ->
        return {
          tooltip: {mode: 'axes', interpolate: false}
          lineMode: 'linear'
          tension: 0.7
          axes: {
            x: {type: 'linear', key: 'x'}
            y: {type: 'linear'}
          }
          series: []
          drawLegend: true
          drawDots: true
        }

      sanitizeOptions: (options, mode) ->
        return this.getDefaultOptions() unless options?

        if mode is 'thumbnail'
          options.drawLegend = false
          options.drawDots = false
          options.tooltip = {mode: 'none', interpolate: false}

        options.series = this.sanitizeSeriesOptions(options.series)

        options.axes = this.sanitizeAxes(options.axes, this.haveSecondYAxis(options.series))

        options.lineMode or= 'linear'
        options.tension = if /^\d+(\.\d+)?$/.test(options.tension) then options.tension else 0.7

        this.sanitizeTooltip(options)

        options.drawLegend = options.drawLegend isnt false
        options.drawDots = options.drawDots isnt false

        return options

      sanitizeTooltip: (options) ->
        if !options.tooltip
          options.tooltip = {mode: 'axes', interpolate: false}
          return

        if options.tooltip.mode not in ['none', 'axes', 'scrubber']
          options.tooltip.mode = 'axes'

        options.tooltip.interpolate = !!options.tooltip.interpolate

        if options.tooltip.mode is 'scrubber' and options.tooltip.interpolate
          throw new Error('Unable to interpolate tooltip for scrubber mode')

      sanitizeSeriesOptions: (options) ->
        return [] unless options?

        colors = d3.scale.category10()
        options.forEach (s, i) ->
          s.axis = if s.axis?.toLowerCase() isnt 'y2' then 'y' else 'y2'
          s.color or= colors(i)
          s.type = if s.type in ['line', 'area', 'column'] then s.type else "line"

          if s.type is 'column'
            delete s.thickness
            delete s.lineMode
          else if not /^\d+px$/.test(s.thickness)
            s.thickness = '1px'

          if s.type in ['line', 'area'] and s.lineMode not in ['dashed']
            delete s.lineMode

        return options

      sanitizeAxes: (axesOptions, secondAxis) ->
        axesOptions = {} unless axesOptions?

        axesOptions.x = this.sanitizeAxisOptions(axesOptions.x)
        axesOptions.x.key or= "x"
        axesOptions.y = this.sanitizeAxisOptions(axesOptions.y)
        axesOptions.y2 = this.sanitizeAxisOptions(axesOptions.y2) if secondAxis

        this.sanitizeExtrema(axesOptions.y)
        this.sanitizeExtrema(axesOptions.y2) if secondAxis

        return axesOptions

      sanitizeExtrema: (options) ->
        min = this.getSanitizedExtremum(options.min)
        if min?
          options.min = min
        else
          delete options.min

        max = this.getSanitizedExtremum(options.max)
        if max?
          options.max = max
        else
          delete options.max



      getSanitizedExtremum: (value) ->
        return undefined unless value?

        number = parseInt(value, 10)

        if isNaN(number)
          $log.warn("Invalid extremum value : #{value}, deleting it.")
          return undefined

        return number


      sanitizeAxisOptions: (options) ->
        return {type: 'linear'} unless options?

        options.type or= 'linear'

        return options
