

describe 'column series', ->
  element = undefined
  innerScope = undefined
  outerScope = undefined

  beforeEach module 'n3-line-chart'
  beforeEach module 'testUtils'

  beforeEach inject (n3utils) ->
    sinon.stub n3utils, 'getDefaultMargins', ->
      top: 20
      right: 50
      bottom: 30
      left: 50

    sinon.stub n3utils, 'getTextBBox', -> {width: 30}

  beforeEach inject (pepito) ->
    {element, innerScope, outerScope} = pepito.directive """
    <div>
      <linechart data='data' options='options'></linechart>
    </div>
    """

  beforeEach ->
    outerScope.$apply ->
      outerScope.data = [
        {abscissa: 0, value: 4}
        {abscissa: 1, value: 8}
        {abscissa: 2, value: 15}
        {abscissa: 3, value: 16}
        {abscissa: 4, value: 23}
        {abscissa: 5, value: 42}
      ]
      outerScope.options =
        axes:
          x:
            key: 'abscissa'

        series: [
          y: 'value'
          color: '#4682b4'
          type: 'column'
        ]


  describe 'utils', ->
    describe 'getMinDelta', ->
      it 'should compute the minimum difference', inject (n3utils) ->
        seriesData = [{
            values: [{x: 1}, {x: 3}, {x:4}]
        }]
        scaleMock = (d) => d

        expect(n3utils.getMinDelta(seriesData, 'x', scaleMock)).to.equal(1)

      it 'should compute the minimum difference in a given range', inject (n3utils) ->
        seriesData = [{
            values: [{x: 1}, {x: 3}, {x:5}, {x:6}]
        }]
        scaleMock = (d) => d
        range = [1, 5]

        expect(n3utils.getMinDelta(seriesData, 'x', scaleMock, range)).to.equal(2)

      it 'should compute the minimum difference in a given scale', inject (n3utils) ->
        seriesData = [{
            values: [{x: 1}, {x: 3}, {x:5}, {x:6}]
        }]
        scaleMock = (d) => 2*d

        expect(n3utils.getMinDelta(seriesData, 'x', scaleMock)).to.equal(2)


    describe 'getPseudoColumns', ->
      it 'should group column series by stacks', inject (n3utils) ->
        options =
          stacks: [
            {series: ['series_0', 'series_1', 'series_2'], axis:'y'},
            {series: ['series_4', 'series_5'], axis:'y2'}
          ]
          series: [
            {id: 'series_0'}
            {id: 'series_1'}
            {id: 'series_2'}
            {id: 'series_3'}
            {id: 'series_4'}
            {id: 'series_5'}
            {id: 'series_6'}
          ]

        data = [
          {id: 'series_0', values: [], type: "column"}
          {id: 'series_1', values: [], type: "column"}
          {id: 'series_2', values: [], type: "column"}
          {id: 'series_4', values: [], type: "column"}
          {id: 'series_5', values: [], type: "column"}
          {id: 'series_6', values: [], type: "line"}
        ]

        expect(n3utils.getPseudoColumns(data, options)).to.eql({
          pseudoColumns:
            series_0: 0
            series_1: 0
            series_2: 0
            series_4: 1
            series_5: 1
          keys: [0, 1]
        })

  it 'should properly configure y axis', ->
    ticks = element.childByClass('y axis').children('text')
    expect(ticks.length).to.equal(10)
    expect(ticks[0].domElement.textContent).to.equal('0')
    expect(ticks[9].domElement.textContent).to.equal('45')

  it 'should configure x axis with extra space', ->
    ticks = element.childByClass('x axis').children('text').map (t) -> t.domElement.textContent
    expect(ticks).to.eql(["-1", "0", "1", "2", "3", "4", "5", "6"])

  it 'should create a group', ->
    content = element.childByClass('content')
    expect(content.children().length).to.equal(1)
    
    columnGroup = content.children()[0]
    expect(columnGroup.getAttribute('class')).to.equal('columnGroup series_0')
    
    firstColumnStyle = columnGroup.children()[0].getAttribute('style').trim()
    expect(firstColumnStyle).to.match(/stroke: rgb\(70, 130, 180\); fill: rgb\(70, 130, 180\);(.)* fill-opacity: 0.7;/)

  describe 'stack', ->
    it 'should work with an empty stack', ->
      outerScope.$apply ->
        outerScope.data = [
          {x: 0, value: 4}
          {x: 1, value: 8}
          {x: 2, value: 15}
          {x: 3, value: 16}
          {x: 4, value: 23}
          {x: 5, value: 42}
        ]
        outerScope.options =
          stacks: [{series: []}]
          series: [
            y: 'value'
            color: '#4682b4'
            type: 'column'
          ]

    it 'should compute the proper y values of a stack', ->
      outerScope.$apply ->
        outerScope.data = [
          {x: 0, y_0: 10, y_1: 10, y_2: 10}
        ]
        outerScope.options =
          stacks: [
            {axis: 'y', series: ['id_0', 'id_1', 'id_2']}
          ]
          series: [
            {id: 'id_0', y: 'y_0', type: 'column'}
            {id: 'id_1', y: 'y_1', type: 'column'}
            {id: 'id_2', y: 'y_2', type: 'column'}
          ]
      content = element.childByClass('content')
      col_0 = content.children()[0].children()[0]
      col_1 = content.children()[1].children()[0]
      col_2 = content.children()[2].children()[0]

      expect(col_0.getAttribute('y')).to.equal('450')
      expect(col_1.getAttribute('y')).to.equal('225')
      expect(col_2.getAttribute('y')).to.equal('0')
    
    it 'should update the y values of a stack when the visibility of a series changes', ->
      outerScope.$apply ->
        outerScope.data = [
          {x: 0, y_0: 10, y_1: 10, y_2: 10}
        ]
        outerScope.options =
          stacks: [
            {axis: 'y', series: ['id_0', 'id_1', 'id_2']}
          ]
          series: [
            {id: 'id_0', y: 'y_0', type: 'column'}
            {id: 'id_1', y: 'y_1', type: 'column'}
            {id: 'id_2', y: 'y_2', type: 'column'}
          ]
      
      element.childrenByClass('legendItem')[0].click()
      
      content = element.childByClass('content')
      col_0 = content.children()[0].children()[0]
      col_1 = content.children()[1].children()[0]
      col_2 = content.children()[2].children()[0]

      expect(col_0).to.equal(undefined)
      expect(col_1.getAttribute('y')).to.equal('450')
      expect(col_2.getAttribute('y')).to.equal('0')

      element.childrenByClass('legendItem')[0].click()
      element.childrenByClass('legendItem')[1].click()
      
      content = element.childByClass('content')
      col_0 = content.children()[0].children()[0]
      col_1 = content.children()[1].children()[0]
      col_2 = content.children()[2].children()[0]

      expect(col_0.getAttribute('y')).to.equal('450')
      expect(col_1).to.equal(undefined)
      expect(col_2.getAttribute('y')).to.equal('0')

      element.childrenByClass('legendItem')[1].click()
      element.childrenByClass('legendItem')[2].click()
      
      content = element.childByClass('content')
      col_0 = content.children()[0].children()[0]
      col_1 = content.children()[1].children()[0]
      col_2 = content.children()[2].children()[0]

      expect(col_0.getAttribute('y')).to.equal('450')
      expect(col_1.getAttribute('y')).to.equal('0')
      expect(col_2).to.equal(undefined)

  it 'should draw columns', ->
    content = element.childByClass('content')

    columnGroup = content.children()[0]
    expect(columnGroup.domElement.nodeName).to.equal('g')
    columns = columnGroup.children()
    expect(columns.length).to.equal(6)
    fn = (att) ->
      (a, b) ->
        a + ' ' + b.getAttribute(att)

    computedX = Array::reduce.call(columns, fn('x'), 'X')
    computedY = Array::reduce.call(columns, fn('y'), 'Y')
    computedH = Array::reduce.call(columns, fn('height'), 'H')
    expect(computedX).to.eql 'X 114 229 343 457 571 686'
    expect(computedY).to.eql 'Y 410 370 300 290 220 30'
    expect(computedH).to.eql 'H 40 80 150 160 230 420'
    i = 0

    while i < columns.length
      expect(columns[i].domElement.nodeName).to.equal('rect')
      expect(columns[i].getStyle('fill-opacity')).to.equal('0.7')
      i++

  it 'should compute the correct column width', ->
    outerScope.$apply ->
      outerScope.data = [
        {x: 0, value: 0}
        {x: 1, value: 8}
        {x: 2, value: 15}
        {x: 3, value: 16}
        {x: 4, value: 23}
        {x: 5, value: 42}
      ]
      outerScope.options = series: [
        y: 'value'
        color: '#4682b4'
        type: 'column'
      ]

    cols = element.childByClass('columnGroup').children()
    expect(cols[0].getAttribute('width')).to.equal('109')

    outerScope.$apply ->
      outerScope.options = series: [{
        y: 'value'
        color: '#4682b4'
        type: 'column'
      }, {
        y: 'value'
        color: '#4682b4'
        type: 'column'
      }]

    cols_0 = element.childrenByClass('columnGroup')[0].children()
    cols_1 = element.childrenByClass('columnGroup')[1].children()
    expect(cols_0[0].getAttribute('width')).to.equal('54.5')
    expect(cols_1[0].getAttribute('width')).to.equal('54.5')

  it 'should draw zero value columns with full height and opacity to zero', ->
    outerScope.$apply ->
      outerScope.data = [
        {x: 0, value: 0}
        {x: 1, value: 8}
        {x: 2, value: 15}
        {x: 3, value: 16}
        {x: 4, value: 23}
        {x: 5, value: 42}
      ]
      outerScope.options = series: [
        y: 'value'
        color: '#4682b4'
        type: 'column'
      ]

    content = element.childByClass('content')
    columnGroup = content.children()[0]
    columns = columnGroup.children()
    expect(columns.length).to.equal(6)
    expectedOpacities = [
      '0'
      '0.7'
      '0.7'
      '0.7'
      '0.7'
      '0.7'
    ]
    fn = (att) ->
      (a, b) ->
        a + ' ' + b.getAttribute(att)

    computedX = Array::reduce.call(columns, fn('x'), 'X')
    computedY = Array::reduce.call(columns, fn('y'), 'Y')
    computedH = Array::reduce.call(columns, fn('height'), 'H')
    expect(computedX).to.eql 'X 114 229 343 457 571 686'
    expect(computedY).to.eql 'Y 0 370 300 290 220 30'
    expect(computedH).to.eql 'H 450 80 150 160 230 420'
    i = 0

    while i < columns.length
      expect(columns[i].domElement.nodeName).to.equal('rect')
      expect(columns[i].getStyle('fill-opacity')).to.equal(expectedOpacities[i])
      i++
    return

  it 'should color the columns with a string value', ->
    
    outerScope.$apply ->
      outerScope.data = [
        {x: 0, value: 5}
        {x: 1, value: 10}
      ]
      outerScope.options = series: [
        y: 'value'
        color: 'red'
        type: 'column'
      ]

    content = element.childByClass('content')
    columnGroup = content.children()[0]
    
    expect(columnGroup.children()[0].getStyle('fill')).to.match(/(rgb\(255, 0, 0\))|(red)/)
    expect(columnGroup.children()[1].getStyle('fill')).to.match(/(rgb\(255, 0, 0\))|(red)/)

  it 'should color the columns with a conditional function', ->
    
    outerScope.$apply ->
      outerScope.data = [
        {x: 0, value: 5}
        {x: 1, value: 10}
      ]
      outerScope.options = series: [
        y: 'value'
        color: (d, i) -> if d?.y > 5 then 'green' else 'red'
        type: 'column'
      ]

    content = element.childByClass('content')
    columnGroup = content.children()[0]
    
    expect(columnGroup.children()[0].getStyle('fill')).to.match(/(rgb\(255, 0, 0\))|(red)/)
    expect(columnGroup.children()[1].getStyle('fill')).to.match(/(rgb\(0, 128, 0\))|(green)/)
  return