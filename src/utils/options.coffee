      getDefaultOptions: ->
        return {
          tooltip: {mode: 'scrubber'}
          lineMode: 'linear'
          tension: 0.7
          margin: this.getDefaultMargins()
          axes: {
            x: {type: 'linear', key: 'x'}
            y: {type: 'linear'}
          }
          series: []
          drawLegend: true
          drawDots: true
          stacks: []
          columnsHGap: 5
          hideOverflow: false
        }

      sanitizeOptions: (options, mode) ->
        options ?= {}

        if mode is 'thumbnail'
          options.drawLegend = false
          options.drawDots = false
          options.tooltip = {mode: 'none', interpolate: false}

        # Parse and sanitize the options
        options.series = this.sanitizeSeriesOptions(options.series)
        options.stacks = this.sanitizeSeriesStacks(options.stacks, options.series)
        options.axes = this.sanitizeAxes(options.axes, this.haveSecondYAxis(options.series))
        options.tooltip = this.sanitizeTooltip(options.tooltip)
        options.margin = this.sanitizeMargins(options.margin)

        options.lineMode or= this.getDefaultOptions().lineMode
        options.tension = if /^\d+(\.\d+)?$/.test(options.tension) then options.tension \
          else this.getDefaultOptions().tension

        options.drawLegend = options.drawLegend isnt false
        options.drawDots = options.drawDots isnt false
        options.columnsHGap = 5 unless angular.isNumber(options.columnsHGap)
        options.hideOverflow = options.hideOverflow or false

        defaultMargin = if mode is 'thumbnail' then this.getDefaultThumbnailMargins() \
          else this.getDefaultMargins()

        # Use default values where no options are defined
        options.series = angular.extend(this.getDefaultOptions().series, options.series)
        options.axes = angular.extend(this.getDefaultOptions().axes, options.axes)
        options.tooltip = angular.extend(this.getDefaultOptions().tooltip, options.tooltip)
        options.margin = angular.extend(defaultMargin, options.margin)

        return options

      sanitizeMargins: (options) ->
        attrs = ['top', 'right', 'bottom', 'left']
        margin = {}

        for opt, value of options
          if opt in attrs
            margin[opt] = parseFloat(value)

        return margin

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
        if !options
          return {mode: 'scrubber'}

        if options.mode not in ['none', 'axes', 'scrubber']
          options.mode = 'scrubber'

        if options.mode is 'scrubber'
          delete options.interpolate
        else
          options.interpolate = !!options.interpolate

        if options.mode is 'scrubber' and options.interpolate
          throw new Error('Interpolation is not supported for scrubber tooltip mode.')

        return options

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

      sanitizeExtrema: (axisOptions) ->
        for extremum in ['min', 'max']
          originalValue = axisOptions[extremum]
          if originalValue?
            axisOptions[extremum] = this.sanitizeExtremum(extremum, axisOptions)

            if ! axisOptions[extremum]?
              $log.warn("Invalid #{extremum} value '#{originalValue}' (parsed as #{axisOptions[extremum]}), ignoring it.")

      sanitizeExtremum: (name, axisOptions) ->
        sanitizer = this.sanitizeNumber

        if axisOptions.type == 'date'
          sanitizer = this.sanitizeDate

        return sanitizer(axisOptions[name])

      sanitizeDate: (value) ->
        return undefined unless value?

        if ! (value instanceof Date) || isNaN(value.valueOf()) # see http://stackoverflow.com/questions/10589732
          return undefined

        return value

      sanitizeNumber: (value) ->
        return undefined unless value?

        number = parseFloat(value)

        if isNaN(number)
          return undefined

        return number

      sanitizeAxisOptions: (options) ->
        return {type: 'linear'} unless options?

        options.type or= 'linear'

        if options.ticksRotate?
          options.ticksRotate = this.sanitizeNumber(options.ticksRotate)

        if options.zoomable?
          options.zoomable = options.zoomable or false

        if options.innerTicks?
          options.innerTicks = options.innerTicks or false

        # labelFunction is deprecated and will be remvoed in 2.x
        # please use ticksFormatter instead
        if options.labelFunction?
          options.ticksFormatter = options.labelFunction

        # String to format tick values
        if options.ticksFormat?

          if options.type is 'date'
            # Use d3.time.format as formatter
            options.ticksFormatter = d3.time.format(options.ticksFormat)

          else
            # Use d3.format as formatter
            options.ticksFormatter = d3.format(options.ticksFormat)

          # use the ticksFormatter per default
          # if no tooltip format or formatter is defined
          options.tooltipFormatter ?= options.ticksFormatter

        # String to format tooltip values
        if options.tooltipFormat?

          if options.type is 'date'
            # Use d3.time.format as formatter
            options.tooltipFormatter = d3.time.format(options.tooltipFormat)

          else
            # Use d3.format as formatter
            options.tooltipFormatter = d3.format(options.tooltipFormat)

        if options.ticksInterval?
          options.ticksInterval = this.sanitizeNumber(options.ticksInterval)

        this.sanitizeExtrema(options)

        return options
