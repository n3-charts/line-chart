describe 'options', ->
  n3utils = undefined

  beforeEach module 'n3-line-chart'

  beforeEach inject (_n3utils_) ->
    n3utils = _n3utils_

  it 'should set the default column gap to 5', ->
    o = n3utils.sanitizeOptions()
    expect(o.columnsHGap).to.equal(5)

    o = n3utils.sanitizeOptions({})
    expect(o.columnsHGap).to.equal(5)

  describe 'stacks', ->
    it 'should create an empty array of none found', ->
      o = n3utils.sanitizeOptions()
      expect(o.stacks).to.eql([])

      o = n3utils.sanitizeOptions({})
      expect(o.stacks).to.eql([])

    it 'should complain if non-existent series are stacked', inject ($log) ->
      sinon.stub($log, 'warn', ->)

      n3utils.sanitizeOptions({
        stacks: [{series: ['series_0']}]
      })

      expect($log.warn.callCount).to.equal(1)

    it 'should complain if series are not on the same axis', inject ($log) ->
      sinon.stub($log, 'warn', ->)

      n3utils.sanitizeOptions({
        stacks: [{series: ['series_0'], axis: 'y'}]
        series: [{id: 'series_0', axis: 'y2'}]
      })

      expect($log.warn.callCount).to.equal(1)

  describe 'drawLegend', ->
    it 'should set default drawLegend value if undefined or invalid', ->
      o = n3utils.sanitizeOptions()
      expect(o.drawLegend).to.equal(true)

    it 'should preserve the given drawLegend value if defined and valid', ->
      o = n3utils.sanitizeOptions(drawLegend: false)
      expect(o.drawLegend).to.equal(false)

  describe 'drawDots', ->
    it 'should set default drawDots value if undefined or invalid', ->
      o = n3utils.sanitizeOptions()
      expect(o.drawDots).to.equal(true)

    it 'should preserve the given drawDots value if defined and valid', ->
      o = n3utils.sanitizeOptions(drawDots: false)
      expect(o.drawDots).to.equal(false)

  describe 'hideOverflow', ->
    it 'should set default hideOverflow value if undefined or invalid', ->
      o = n3utils.sanitizeOptions()
      expect(o.hideOverflow).to.equal(false)

    it 'should preserve the given hideOverflow value if defined and valid', ->
      o = n3utils.sanitizeOptions(hideOverflow: true)
      expect(o.hideOverflow).to.equal(true)

  describe 'tooltip', ->
    it 'should set default tooltip.mode if undefined or invalid', ->
      o = n3utils.sanitizeOptions()
      expect(o.tooltip).to.eql({mode: 'scrubber'})

      o = n3utils.sanitizeOptions({})
      expect(o.tooltip).to.eql({mode: 'scrubber'})

      o = n3utils.sanitizeOptions({tooltip: {interpolate: true}})
      expect(o.tooltip).to.eql({mode: 'scrubber'})

  describe 'linemode', ->
    it 'should add the default tension', ->
      o = n3utils.sanitizeOptions()
      expect(o.tension).to.equal(0.7)

    it 'should preserve the given tension', ->
      o = n3utils.sanitizeOptions(tension: 0.95)
      expect(o.tension).to.equal(0.95)

  describe 'margin', ->
    it 'should use the default margin', ->
      o = n3utils.sanitizeOptions()
      expect(o.margin.top).to.equal(20)
      expect(o.margin.right).to.equal(50)
      expect(o.margin.bottom).to.equal(60)
      expect(o.margin.left).to.equal(50)

    it 'should use the default thumbnail margin', ->
      o = n3utils.sanitizeOptions(null, 'thumbnail')
      expect(o.margin.top).to.equal(1)
      expect(o.margin.right).to.equal(1)
      expect(o.margin.bottom).to.equal(2)
      expect(o.margin.left).to.equal(0)

    it 'should parse margins as float', ->
      o = n3utils.sanitizeOptions({
        margin: {top: '20.05', left: 40.68 }
      })
      expect(o.margin.top).to.equal(20.05)
      expect(o.margin.left).to.equal(40.68)

  describe 'axes', ->
    it 'should return default options when given null or undefined', ->
      expect(n3utils.sanitizeOptions().axes).to.eql
          x:
            type: 'linear'
            key: 'x'

          y:
            type: 'linear'

    it 'should set default axes and empty series', ->
      o = n3utils.sanitizeOptions({})
      expect(o.axes).to.eql
        x:
          type: 'linear'
          key: 'x'

        y:
          type: 'linear'

      expect(o.series).to.eql []

    it 'should set default x axis type to linear', ->
      o = n3utils.sanitizeOptions(axes:
        x: {}
        y: {}
      )
      expect(o.axes.x.type).to.equal('linear')
      expect(o.axes.y.type).to.equal('linear')

    it 'should set default y axis', ->
      o = n3utils.sanitizeOptions(axes:
        x: {}
      )
      expect(o.axes.y).to.eql type: 'linear'

    it 'should set default x axis', ->
      expect(n3utils.sanitizeOptions(
        tooltip: {mode: 'axes', interpolate: false}
        lineMode: 'linear'
        axes: {}
      ).axes).to.eql
        x:
          type: 'linear'
          key: 'x'
        y:
          type: 'linear'

    it 'should allow x axis configuration', ->
      expect(n3utils.sanitizeOptions(
        tooltip: {mode: 'axes', interpolate: false}
        lineMode: 'linear'
        axes:
          x:
            key: 'foo'
      ).axes).to.eql
        x:
          type: 'linear'
          key: 'foo'
        y:
          type: 'linear'

    it 'should allow x axes extrema configuration', ->
      expected =
        x:
          type: 'linear'
          key: 'x'
          min: 5
          max: 15
        y:
          type: 'linear'

      computed = n3utils.sanitizeOptions(
        tooltip: {mode: 'axes', interpolate: false}
        lineMode: 'linear'
        axes:
          x:
            min: '5'
            max: 15
      ).axes

      expect(computed).to.eql(expected)

    it 'should pass the ticks property, whatever it is', ->
      expected =
        x:
          type: 'linear'
          key: 'x'
          ticks: 2
        y:
          type: 'linear'
          ticks: [5]
        y2:
          type: 'date'
          ticks: d3.time.minute

      computed = n3utils.sanitizeOptions(
        axes:
          x:
            ticks: 2
          y:
            ticks: [5]
          y2:
            type: 'date'
            ticks: d3.time.minute
      ).axes

      expect(computed).to.eql(expected)

    it 'should pass the ticksInterval property as a number', ->
      expected =
        x:
          type: 'date'
          key: 'x'
          ticks: d3.time.minute
          ticksInterval: 5
        y:
          type: 'date'
          ticks: d3.time.minute
          ticksInterval: 10

      computed = n3utils.sanitizeOptions(
        axes:
          x:
            type: 'date'
            ticks: d3.time.minute
            ticksInterval: 5
          y:
            type: 'date'
            ticks: d3.time.minute
            ticksInterval: '10'
      ).axes

      expect(computed).to.eql(expected)

    it 'should allow y axes extrema configuration', ->
      expected =
        x:
          type: 'linear'
          key: 'x'
        y:
          type: 'linear'
          min: 5
          max: 15

      computed = n3utils.sanitizeOptions(
        tooltip: {mode: 'axes', interpolate: false}
        lineMode: 'linear'
        axes:
          y:
            min: '5'
            max: 15
      ).axes

      expect(computed).to.eql(expected)

    it 'should log a warning if non number value given as extrema', inject ($log) ->
      sinon.stub($log, 'warn', ->)

      expected =
        x:
          type: 'linear'
          key: 'x'
        y:
          type: 'linear'
          max: 15

      computed = n3utils.sanitizeOptions(
        tooltip: {mode: 'axes', interpolate: false}
        lineMode: 'linear'
        axes:
          y:
            min: 'pouet'
            max: 15
      ).axes

      expect(computed.y.min).to.equal(expected.y.min)
      expect($log.warn.callCount).to.equal(1)

    it 'should not log a warning if no values are given as extrema', inject ($log) ->
      sinon.stub($log, 'warn', ->)

      expected =
        x:
          type: 'linear'
          key: 'x'
        y:
          type: 'linear'
          max: 15

      computed = n3utils.sanitizeOptions(
        tooltip: {mode: 'axes', interpolate: false}
        lineMode: 'linear'
        axes:
          y:
            max: 15
      ).axes

      expect(computed).to.eql(expected)
      expect($log.warn.callCount).to.equal(0)

    it 'should parse extrema options as floats', inject ($log) ->
      sinon.stub($log, 'warn', ->)

      computed = n3utils.sanitizeOptions(
        axes:
          y:
            min: '13.421'
            max: 15.23
      ).axes

      expect(computed.y.min).to.equal(13.421)
      expect(computed.y.max).to.equal(15.23)

    it 'should create a formatter function when ticks format is defined', ->
      computed = n3utils.sanitizeOptions(
        axes:
          x:
            ticksFormat: '.2f'
      ).axes

      expect(computed.x.ticksFormatter(2)).to.equal('2.00')

    it 'should create a time formatter function when ticks format is defined on date axis', ->
      computed = n3utils.sanitizeOptions(
        axes:
          x:
            type: 'date'
            ticksFormat: "%Y-%m-%d"
      ).axes

      expect(computed.x.ticksFormatter(new Date(2015,0,1))).to.equal('2015-01-01')

    it 'should use the ticks formatter function when no tooltip format is defined', ->
      computed = n3utils.sanitizeOptions(
        axes:
          x:
            ticksFormat: '.2f'
      ).axes

      expect(computed.x.tooltipFormatter(2)).to.equal('2.00')

    it 'should create a formatter function when tooltip format is defined', ->
      computed = n3utils.sanitizeOptions(
        axes:
          x:
            tooltipFormat: '.2f'
      ).axes

      expect(computed.x.tooltipFormatter(2)).to.equal('2.00')

    it 'should create a time formatter function when tooltip format is defined on date axis', ->
      computed = n3utils.sanitizeOptions(
        axes:
          x:
            type: 'date'
            tooltipFormat: "%Y-%m-%d"
      ).axes

      expect(computed.x.tooltipFormatter(new Date(2015,0,1))).to.equal('2015-01-01')

    it 'should parse the ticksRotate as floats', ->
      computed = n3utils.sanitizeOptions(
        axes:
          x:
            type: 'date'
            ticksRotate: 20.05,
          y:
            type: 'linear'
            ticksRotate: '40.25'
          y2:
            type: 'linear'
            ticksRotate: -45
      ).axes

      expect(computed.x.ticksRotate).to.equal(20.05)
      expect(computed.y.ticksRotate).to.equal(40.25)
      expect(computed.y2.ticksRotate).to.equal(-45.00)

    it 'should not set default zoomable value if undefined', ->
      computed = n3utils.sanitizeOptions(
        axes:
          x:
            type: 'linear'
      ).axes
      expect(computed.x.zoomable).to.equal(undefined)

    it 'should preserve the given zoomable value if defined and valid', ->
      computed = n3utils.sanitizeOptions(
        axes:
          x:
            zoomable: true
      ).axes
      expect(computed.x.zoomable).to.equal(true)

    it 'should not set default innerTicks value if undefined', ->
      computed = n3utils.sanitizeOptions(
        axes:
          x:
            type: 'linear'
      ).axes
      expect(computed.x.innerTicks).to.equal(undefined)

    it 'should preserve the given innerTicks value if defined and valid', ->
      computed = n3utils.sanitizeOptions(
        axes:
          x:
            innerTicks: true
      ).axes
      expect(computed.x.innerTicks).to.equal(true)

    it 'should not set default grid value if undefined', ->
      computed = n3utils.sanitizeOptions(
        axes:
          x:
            type: 'linear'
      ).axes
      expect(computed.x.grid).to.equal(undefined)

    it 'should preserve the given grid value if defined and valid', ->
      computed = n3utils.sanitizeOptions(
        axes:
          x:
            grid: true
      ).axes
      expect(computed.x.grid).to.equal(true)

    describe 'of type date', ->
      min = new Date('2015-01-01')
      max = new Date('2016-01-01')

      it 'should allow x axes extrema configuration', ->
        expected =
          x:
            type: 'date'
            key: 'x'
            min: min
            max: max
          y:
            type: 'linear'

        computed = n3utils.sanitizeOptions(
          tooltip: {mode: 'axes', interpolate: false}
          axes:
            x:
              type: 'date'
              min: min
              max: max
        ).axes

        expect(computed).to.eql(expected)

      it 'should allow y axes extrema configuration', ->
        expected =
          x:
            type: 'linear'
            key: 'x'
          y:
            type: 'date'
            min: min
            max: max

        computed = n3utils.sanitizeOptions(
          tooltip: {mode: 'axes', interpolate: false}
          axes:
            y:
              type: 'date'
              min: min
              max: max
        ).axes

        expect(computed).to.eql(expected)

      it 'should log a warning if non date value given as minimum', inject ($log) ->
        sinon.stub($log, 'warn', ->)

        expected =
          x:
            type: 'linear'
            key: 'x'
          y:
            type: 'date'
            max: max

        computed = n3utils.sanitizeOptions(
          tooltip: {mode: 'axes', interpolate: false}
          axes:
            y:
              type: 'date'
              min: 'pouet'
              max: max
        ).axes

        expect(computed.y.min).to.equal(expected.y.min)
        expect($log.warn.callCount).to.equal(1)

      it 'should log a warning if non date value given as maximum', inject ($log) ->
        sinon.stub($log, 'warn', ->)

        expected =
          x:
            type: 'linear'
            key: 'x'
          y:
            type: 'date'
            min: min

        computed = n3utils.sanitizeOptions(
          tooltip: {mode: 'axes', interpolate: false}
          axes:
            y:
              type: 'date'
              min: min
              max: 'pouet'
        ).axes

        expect(computed.y.max).to.equal(expected.y.max)
        expect($log.warn.callCount).to.equal(1)

  describe 'series', ->
    it 'should throw an error if twice the same id is found', ->
      expect(->n3utils.sanitizeSeriesOptions([
        {id: 'pouet'}
        {id: 'pouet'}
      ])).to.throw()

    it 'should give an id to series if none has been found', ->
      o = n3utils.sanitizeSeriesOptions([
        {type: 'line', drawDots: false}
        {type: 'line', drawDots: true, id: 'series_0'}
        {type: 'column', drawDots: true, id: 'tut'}
        {type: 'area', drawDots: false}
      ])

      expected = [
        {
          type: "line"
          drawDots: false
          id: 'series_1'
          axis: "y"
          color: "#1f77b4"
          thickness: "1px"
        }
        {
          type: "line"
          id: 'series_0'
          drawDots: true
          axis: "y"
          color: "#ff7f0e"
          thickness: "1px"
          dotSize: 2
        }
        {
          type: "column"
          id: "tut"
          axis: "y"
          color: "#2ca02c"
        }
        {
          type: "area"
          id: 'series_2'
          drawDots: false
          axis: "y"
          color: "#d62728"
          thickness: "1px"
        }
      ]

      expect(o).to.eql(expected)

    it 'should preserve/remove the drawDots setting', ->
      o = n3utils.sanitizeSeriesOptions([
        {type: 'line', drawDots: false}
        {type: 'line', drawDots: true}
        {type: 'column', drawDots: true}
        {type: 'area', drawDots: false}
      ])

      expect(o[0].drawDots).to.equal(false)
      expect(o[1].drawDots).to.equal(true)
      expect(o[2].drawDots).to.equal(undefined)
      expect(o[3].drawDots).to.equal(false)

    it 'should preserve/remove the dotSize setting', ->
      o = n3utils.sanitizeSeriesOptions([
        {type: 'line', drawDots: false, dotSize: 10}
        {type: 'line', drawDots: true, dotSize: 5}
        {type: 'column', drawDots: true, dotSize: 2}
        {type: 'area'}
      ])

      expect(o[0].dotSize).to.equal(undefined)
      expect(o[1].dotSize).to.equal(5)
      expect(o[2].dotSize).to.equal(undefined)
      expect(o[3].dotSize).to.equal(2)


    it 'should sanitize lineMode', ->
      f = n3utils.sanitizeSeriesOptions

      expect(f([
        {type: 'line', lineMode: 'dashed'}
        {type: 'line', lineMode: 42}
        {type: 'area', lineMode: 'dashed'}
        {type: 'column', lineMode: 'dashed'}
        {type: 'column'}
      ])).to.eql [
        {
          type: "line",
          id: 'series_0'
          lineMode: "dashed",
          axis: "y",
          color: "#1f77b4",
          thickness: "1px"
          dotSize: 2
        },
        {
          type: "line",
          id: 'series_1'
          axis: "y",
          color: "#ff7f0e",
          thickness: "1px"
          dotSize: 2
        },
        {
          type: "area",
          id: 'series_2'
          lineMode: "dashed",
          axis: "y",
          color: "#2ca02c",
          thickness: "1px"
          dotSize: 2
        },
        {
          type: "column",
          id: 'series_3'
          axis: "y",
          color: "#d62728"
        },
        {
          type: "column",
          id: 'series_4'
          axis: "y",
          color: "#9467bd"
        }
      ]

    it 'should set y as the default axis', ->
      f = n3utils.sanitizeSeriesOptions
      expect(f([
        {}
        {type: 'area', thickness: '2px'}
        {type: 'area', color: 'red', thickness: 'dans ton ***'}
        {type: 'column', axis: 'y2'}
      ])).to.eql [
        {id: 'series_0', type: 'line', color: '#1f77b4', thickness: '1px', axis: 'y', dotSize: 2}
        {id: 'series_1', type: 'area', color: '#ff7f0e', thickness: '2px', axis: 'y', dotSize: 2}
        {id: 'series_2', type: 'area', color: 'red', thickness: '1px', axis: 'y', dotSize: 2}
        {id: 'series_3', type: 'column', color: '#2ca02c', axis: 'y2'}
      ]

    it 'should set line or area\'s line thickness', ->
      f = n3utils.sanitizeSeriesOptions

      expect(f([
        {}
        {type: 'area', thickness: '2px'}
        {type: 'area', color: 'red', thickness: 'dans ton ***'}
        {type: 'column'}
      ])).to.eql [
        {id: 'series_0', type: 'line', color: '#1f77b4', thickness: '1px', axis: 'y', dotSize: 2}
        {id: 'series_1', type: 'area', color: '#ff7f0e', thickness: '2px', axis: 'y', dotSize: 2}
        {id: 'series_2', type: 'area', color: 'red', thickness: '1px', axis: 'y', dotSize: 2}
        {id: 'series_3', type: 'column', color: '#2ca02c', axis: 'y'}
      ]

    it 'should set series colors if none found', ->
      expect(n3utils.sanitizeOptions(series: [
        {y: 'value', color: 'steelblue', type: 'area', label: 'Pouet'}
        {y: 'otherValue', axis: 'y2'}
      ]).series).to.eql [
        {
          y: 'value'
          id: 'series_0'
          axis: 'y'
          color: 'steelblue'
          type: 'area'
          label: 'Pouet'
          thickness: '1px'
          dotSize: 2
        }
        {
          y: 'otherValue'
          id: 'series_1'
          axis: 'y2'
          color: '#1f77b4'
          type: 'line'
          thickness: '1px'
          dotSize: 2
        }
      ]
