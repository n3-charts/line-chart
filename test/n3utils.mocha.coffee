describe 'n3utils', ->
  beforeEach module 'n3-charts.linechart'
  beforeEach module 'testUtils'

  n3utils = undefined

  beforeEach inject (_n3utils_) ->
    n3utils = _n3utils_

  describe 'getBestColumnWidth', ->
    it 'should handle no data', ->
      expect(n3utils.getBestColumnWidth({}, [])).to.equal 10

  it 'should compute data per series', ->
    data = [
      {x: 0, foo: 4.154, value: 4}
      {x: 1, foo: 8.15485}
      {x: 2, foo: 3.14, value: 8}
    ]

    xFormatter = (text) -> ''

    options =
      axes:
        x:
          key: 'x'
          tooltipFormatter: xFormatter

      series: [
        {
          y: 'value'
          axis: 'y2'
          color: 'steelblue'
          type: 'line'
          thickness: '1px'
        }
        {
          y: 'foo'
          color: 'red'
          type: 'area'
          thickness: '3px'
        }
      ]

    expected = [
      {
        xFormatter: xFormatter
        index: 0
        name: 'value'
        values: [
          {x: 0, value: 4, axis: 'y2'}
          {x: 2, value: 8, axis: 'y2'}
        ]
        color: 'steelblue'
        axis: 'y2'
        type: 'line'
        thickness: '1px'
      }
      {
        xFormatter: xFormatter
        index: 1
        name: 'foo'
        values: [
          {x: 0, value: 4.154, axis: 'y'}
          {x: 1, value: 8.15485, axis: 'y'}
          {x: 2, value: 3.14, axis: 'y'}
        ]
        color: 'red'
        axis: 'y'
        type: 'area'
        thickness: '3px'
      }
    ]
    computed = n3utils.getDataPerSeries(data, options)

    keys = [
      'xFormatter'
      'index'
      'name'
      'values'
      'color'
      'axis'
      'type'
      'thickness'
    ]

    keys.forEach (k) ->
      expect(computed[0][k]).to.eql expected[0][k]
      expect(computed[1][k]).to.eql expected[1][k]

  it 'should compute the widest y value', ->
    data = [
      {x: 0, foo: 4.154, value: 4}
      {x: 1, foo: 8.15485, value: 8}
      {x: 2, foo: 1.1548578, value: 15}
      {x: 3, foo: 1.154}
      {x: 4, foo: 2.45, value: 23}
      {x: 5, foo: 4, value: 42}
    ]
    series = [y: 'value']
    expect(n3utils.getWidestOrdinate(data, series)).to.equal 15
    series = [
      {y: 'value'}
      {y: 'foo'}
    ]
    expect(n3utils.getWidestOrdinate(data, series)).to.equal 1.1548578

  describe 'adjustMargins', ->
    beforeEach ->
      sinon.stub n3utils, 'getDefaultMargins', ->
        top: 20
        right: 50
        bottom: 30
        left: 50

    it 'should return default margins for no series', ->
      data = [
        {x: 0, foo: 4.154, value: 4}
        {x: 1, foo: 8.15485, value: 8}
        {x: 2, foo: 1.1548578, value: 15}
        {x: 3, foo: 1.154, value: 16}
        {x: 4, foo: 2.45, value: 23}
        {x: 5, foo: 4, value: 42}
      ]
      dimensions =
        left: 10
        right: 10

      options = series: []
      n3utils.adjustMargins dimensions, options, data
      expect(dimensions).to.eql
        left: 30
        right: 50
        top: 20
        bottom: 30


    it 'should adjust margins for one left series', ->
      data = [
        {x: 0, foo: 4.154, value: 4}
        {x: 1, foo: 8.15485, value: 8}
        {x: 2, foo: 1.1548578, value: 15}
        {x: 3, foo: 1.154, value: 16}
        {x: 4, foo: 2.45, value: 23}
        {x: 5, foo: 4, value: 42}
      ]
      dimensions =
        left: 10
        right: 10

      options = series: [y: 'value']
      n3utils.adjustMargins dimensions, options, data
      expect(dimensions).to.eql
        left: 40
        right: 50
        top: 20
        bottom: 30


    it 'should adjust margins for two left series', ->
      data = [
        {x: 0, foo: 4.154, value: 4}
        {x: 1, foo: 8.15485, value: 8}
        {x: 2, foo: 1.1548578, value: 15}
        {x: 3, foo: 1.154, value: 16}
        {x: 4, foo: 2.45, value: 23}
        {x: 5, foo: 4, value: 42}
      ]
      dimensions =
        left: 10
        right: 10

      options = series: [
        {y: 'value'}
        {y: 'foo'}
      ]
      n3utils.adjustMargins dimensions, options, data
      expect(dimensions).to.eql
        left: 75
        right: 50
        top: 20
        bottom: 30


    it 'should adjust margins for one left series and one right series', ->
      data = [
        {x: 0, foo: 4.154, value: 4}
        {x: 1, foo: 8.15485, value: 8}
        {x: 2, foo: 1.1548578, value: 15}
        {x: 3, foo: 1.154, value: 16}
        {x: 4, foo: 2.45, value: 23}
        {x: 5, foo: 4, value: 42}
      ]
      dimensions =
        left: 10
        right: 10

      options = series: [
        {y: 'value'}
        {axis: 'y2', y: 'foo'}
      ]
      n3utils.adjustMargins dimensions, options, data
      expect(dimensions).to.eql
        left: 40
        right: 75
        top: 20
        bottom: 30
