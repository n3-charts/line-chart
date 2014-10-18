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
      expect(o.drawLegend).to.equal true

    it 'should preserve the given drawLegend value if defined and valid', ->
      o = n3utils.sanitizeOptions(drawLegend: false)
      expect(o.drawLegend).to.equal false

  describe 'drawDots', ->
    it 'should set default drawDots value if undefined or invalid', ->
      o = n3utils.sanitizeOptions()
      expect(o.drawDots).to.equal true

    it 'should preserve the given drawDots value if defined and valid', ->
      o = n3utils.sanitizeOptions(drawDots: false)
      expect(o.drawDots).to.equal false

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
      expect(o.tension).to.equal 0.7

    it 'should preserve the given tension', ->
      o = n3utils.sanitizeOptions(tension: 0.95)
      expect(o.tension).to.equal 0.95


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
      expect(o.axes.x.type).to.equal 'linear'
      expect(o.axes.y.type).to.equal 'linear'

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

      computed = n3utils.sanitizeOptions(
        axes:
          x:
            ticks: 2
          y:
            ticks: [5]
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

      expect(computed).to.eql(expected)
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
