describe 'misc', ->
  beforeEach module 'n3-line-chart'
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

    options =
      axes:
        x: {key: 'x'}

      series: [
        {y: 'value', axis: 'y2', color: 'steelblue', type: 'line', thickness: '1px', drawDots: true, dotSize: 5}
        {id: 'id_1', y: 'foo', color: 'red', type: 'area', thickness: '3px', drawDots: true, dotSize: 2}
      ]

    expected = [
      {
        index: 0
        name: 'value'
        values: [{x: 0, y0: 0, y: 4, axis: 'y2', dotSize: 5}, {x: 2, y0: 0, y: 8, axis: 'y2', dotSize: 5}]
        color: 'steelblue'
        axis: 'y2'
        type: 'line'
        xOffset: 0
        thickness: '1px'
        drawDots: true
        dotSize: 5
      }
      {
        id: 'id_1'
        index: 1
        name: 'foo'
        values: [{x: 0, y0: 0, y: 4.154, axis: 'y', dotSize: 2}, {x: 1, y0: 0, y: 8.15485, axis: 'y', dotSize: 2}, {x: 2, y0: 0, y: 3.14, axis: 'y', dotSize: 2} ]
        color: 'red'
        axis: 'y'
        type: 'area'
        xOffset: 0
        thickness: '3px'
        drawDots: true
        dotSize: 2
      }
    ]
    computed = n3utils.getDataPerSeries(data, options)

    expect(computed).to.eql(expected)

  it 'should compute data per series (for stacked series)', ->
    data = [
      {x: 0, foo: 4.154, value: 4}
      {x: 1, foo: 8.15485, value: 2}
      {x: 2, foo: 3.14, value: 8}
    ]

    options =
      stacks: [
        {series: ['id_0', 'id_1']}
      ]
      axes:
        x: {key: 'x'}

      series: [
        {id: 'id_0', y: 'value', color: 'steelblue', type: 'line', thickness: '1px', drawDots: true, dotSize: 2}
        {id: 'id_1', y: 'foo', color: 'red', type: 'area', thickness: '3px', drawDots: false}
      ]

    expected = [
      {
        index: 0
        id: 'id_0'
        name: 'value'
        values: [{x: 0, y0: 0, y: 4, axis: 'y', dotSize: 2}, {x: 1, y0: 0, y: 2, axis: 'y', dotSize: 2}, {x: 2, y0: 0, y: 8, axis: 'y', dotSize: 2}]
        color: 'steelblue'
        axis: 'y'
        type: 'line'
        xOffset: 0
        thickness: '1px'
        drawDots: true
        dotSize: 2
      }
      {
        index: 1
        id: 'id_1'
        name: 'foo'
        values: [{x: 0, y0: 4, y: 4.154, axis: 'y'}, {x: 1, y0: 2, y: 8.15485, axis: 'y'}, {x: 2, y0: 8, y: 3.14, axis: 'y'}]
        color: 'red'
        axis: 'y'
        type: 'area'
        xOffset: 0
        thickness: '3px'
        drawDots: false
      }
    ]
    computed = n3utils.getDataPerSeries(data, options)

    expect(computed).to.eql(expected)

  it 'should compute the widest y value', ->
    data = [
      {x: 0, foo: 4.154, value: 4}
      {x: 1, foo: 8.15485, value: 8}
      {x: 2, foo: 1.1548578, value: 15}
      {x: 3, foo: 1.154}
      {x: 4, foo: 2.45, value: 23}
      {x: 5, foo: 4, value: 42}
    ]

    options =
      axes:
        x: {}
        y: {}

    series = [y: 'value']
    expect(n3utils.getWidestOrdinate(data, series, options)).to.equal 15

    series = [{y: 'value'}, {y: 'foo'}]
    expect(n3utils.getWidestOrdinate(data, series, options)).to.equal 1.1548578

  it 'should compute the widest y value - with a labelFunction', ->
    data = [
      {x: 0, foo: 4.154, value: 4}
      {x: 1, foo: 8.15485, value: 8}
      {x: 2, foo: 1.1548578, value: 15}
      {x: 3, foo: 1.154}
      {x: 4, foo: 2.45, value: 23}
      {x: 5, foo: 4, value: 42}
    ]
    options =
      axes:
        x: {}
        y: {}
        y2: {labelFunction: (v) -> 'huehuehuehuehue'}

    series = [y: 'value']
    expect(n3utils.getWidestOrdinate(data, series, options)).to.equal 15

    series = [{y: 'value'}, {y: 'foo', axis: 'y2'}]
    expect(n3utils.getWidestOrdinate(data, series, options)).to.equal 'huehuehuehuehue'
