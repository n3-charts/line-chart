      getDefaultOptions: ->
        return {
          tooltipMode: 'default'
          lineMode: 'linear'
          tension: 0.7
          axes: {
            x: {type: 'linear', key: 'x'}
            y: {type: 'linear'}
          }
          series: []
        }

      sanitizeOptions: (options) ->
        return this.getDefaultOptions() unless options?

        options.series = this.sanitizeSeriesOptions(options.series)

        options.axes = this.sanitizeAxes(options.axes, this.haveSecondYAxis(options.series))

        options.lineMode or= 'linear'
        options.tension = if /^\d+(\.\d+)?$/.test(options.tension) then options.tension else 0.7

        options.tooltipMode or= 'default'

        return options

      sanitizeSeriesOptions: (options) ->
        return [] unless options?

        colors = d3.scale.category10()
        options.forEach (s, i) ->
          s.axis = if s.axis?.toLowerCase() isnt 'y2' then 'y' else 'y2'
          s.color or= colors(i)
          s.type = if s.type in ['line', 'area', 'column'] then s.type else "line"

          if s.type is 'column'
            delete s.thickness
          else if not /^\d+px$/.test(s.thickness)
            s.thickness = '1px'

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
