describe 'options', ->
  n3utils = undefined

  beforeEach module 'n3-line-chart'

  beforeEach inject (_n3utils_) ->
    n3utils = _n3utils_

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

  describe 'tooltipMode', ->
    it 'should preserve the given tooltipMode value if defined and valid', ->
      o = n3utils.sanitizeOptions(tooltipMode: 'none')
      expect(o.tooltipMode).to.equal 'none'
      o = n3utils.sanitizeOptions(tooltipMode: 'dots')
      expect(o.tooltipMode).to.equal 'dots'
      o = n3utils.sanitizeOptions(tooltipMode: 'lines')
      expect(o.tooltipMode).to.equal 'lines'
      o = n3utils.sanitizeOptions(tooltipMode: 'both')
      expect(o.tooltipMode).to.equal 'both'

    it 'should set default tooltipMode if undefined or invalid', ->
      o = n3utils.sanitizeOptions()
      expect(o.tooltipMode).to.equal 'dots'
      o = n3utils.sanitizeOptions(tooltipMode: 'invalidOption')
      expect(o.tooltipMode).to.equal 'dots'

  describe 'linemode', ->
    it 'should add the default tension', ->
      o = n3utils.sanitizeOptions()
      expect(o.tension).to.equal 0.7

    it 'should preserve the given tension', ->
      o = n3utils.sanitizeOptions(tension: 0.95)
      expect(o.tension).to.equal 0.95


  describe 'axes', ->
    it 'should return default options when given null or undefined', ->
      expect(n3utils.sanitizeOptions()).to.eql
        tooltipMode: 'dots'
        lineMode: 'linear'
        tension: 0.7
        drawLegend: true
        drawDots: true

        axes:
          x:
            type: 'linear'
            key: 'x'

          y:
            type: 'linear'

        series: []


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
        tooltipMode: 'dots'
        lineMode: 'linear'
        axes: {}
      )).to.eql
        tooltipMode: 'dots'
        lineMode: 'linear'
        tension: 0.7
        drawLegend: true
        drawDots: true

        axes:
          x:
            type: 'linear'
            key: 'x'

          y:
            type: 'linear'

        series: []


    it 'should allow x axis key configuration', ->
      expect(n3utils.sanitizeOptions(
        tooltipMode: 'dots'
        lineMode: 'linear'
        axes:
          x:
            key: 'foo'
      )).to.eql
        tooltipMode: 'dots'
        lineMode: 'linear'
        tension: 0.7
        drawLegend: true
        drawDots: true

        axes:
          x:
            type: 'linear'
            key: 'foo'

          y:
            type: 'linear'

        series: []


    it 'should allow y axes extrema configuration', ->
      expected =
        tooltipMode: 'dots'
        lineMode: 'linear'
        tension: 0.7
        drawLegend: true
        drawDots: true

        axes:
          x:
            type: 'linear'
            key: 'x'

          y:
            type: 'linear'
            min: 5
            max: 15

        series: []

      computed = n3utils.sanitizeOptions(
        tooltipMode: 'dots'
        lineMode: 'linear'
        axes:
          y:
            min: '5'
            max: 15
      )

      expect(computed).to.eql(expected)

    it 'should log a warning if non number value given as extrema', inject ($log) ->
      sinon.stub($log, 'warn', ->)

      expected =
        tooltipMode: 'dots'
        lineMode: 'linear'
        tension: 0.7
        drawLegend: true
        drawDots: true

        axes:
          x:
            type: 'linear'
            key: 'x'

          y:
            type: 'linear'
            max: 15

        series: []

      computed = n3utils.sanitizeOptions(
        tooltipMode: 'dots'
        lineMode: 'linear'
        axes:
          y:
            min: 'pouet'
            max: 15
      )

      expect(computed).to.eql(expected)
      expect($log.warn.callCount).to.equal(1)



  describe 'series', ->
    it 'should set y as the default axis', ->
      f = n3utils.sanitizeSeriesOptions
      expect(f([
        {}
        {type: 'area', thickness: '2px'}
        {type: 'area', color: 'red', thickness: 'dans ton ***'}
        {type: 'column', axis: 'y2'}
      ])).to.eql [
        {type: 'line', color: '#1f77b4', thickness: '1px', axis: 'y'}
        {type: 'area', color: '#ff7f0e', thickness: '2px', axis: 'y'}
        {type: 'area', color: 'red', thickness: '1px', axis: 'y'}
        {type: 'column', color: '#2ca02c', axis: 'y2'}
      ]

    it 'should set line or area\'s line thickness', ->
      f = n3utils.sanitizeSeriesOptions

      expect(f([
        {}
        {type: 'area', thickness: '2px'}
        {type: 'area', color: 'red', thickness: 'dans ton ***'}
        {type: 'column'}
      ])).to.eql [
        {type: 'line', color: '#1f77b4', thickness: '1px', axis: 'y'}
        {type: 'area', color: '#ff7f0e', thickness: '2px', axis: 'y'}
        {type: 'area', color: 'red', thickness: '1px', axis: 'y'}
        {type: 'column', color: '#2ca02c', axis: 'y'}
      ]

    it 'should set series colors if none found', ->
      expect(n3utils.sanitizeOptions(series: [
        {y: 'value', color: 'steelblue', type: 'area', label: 'Pouet'}
        {y: 'otherValue', axis: 'y2'}
      ])).to.eql
        tooltipMode: 'dots'
        lineMode: 'linear'
        tension: 0.7
        drawLegend: true
        drawDots: true

        axes:
          x:
            type: 'linear'
            key: 'x'

          y:
            type: 'linear'

          y2:
            type: 'linear'

        series: [
          {
            y: 'value'
            axis: 'y'
            color: 'steelblue'
            type: 'area'
            label: 'Pouet'
            thickness: '1px'
          }
          {
            y: 'otherValue'
            axis: 'y2'
            color: '#1f77b4'
            type: 'line'
            thickness: '1px'
          }
        ]
