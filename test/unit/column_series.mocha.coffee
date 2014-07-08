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


  it 'should properly configure y axis', ->
    ticks = element.childByClass('y axis').children('text')
    expect(ticks.length).to.equal 10
    expect(ticks[0].domElement.textContent).to.equal '0'
    expect(ticks[9].domElement.textContent).to.equal '45'

  it 'should configure x axis with extra space', ->
    ticks = element.childByClass('x axis').children('text')
    expect(ticks.length).to.equal 8
    expect(ticks[0].domElement.textContent).to.equal '0'
    expect(ticks[7].domElement.textContent).to.equal '6'

  it 'should create a group', ->
    content = element.childByClass('content')
    expect(content.children().length).to.equal 1
    columnGroup = content.children()[0]
    expect(columnGroup.getAttribute('class')).to.equal 'columnGroup series_0'
    expect(columnGroup.getAttribute('style').trim()).to.equal 'stroke: rgb(70, 130, 180); fill: rgb(70, 130, 180); fill-opacity: 0.8;'

  it 'should draw columns', ->
    content = element.childByClass('content')

    columnGroup = content.children()[0]
    expect(columnGroup.domElement.nodeName).to.equal 'g'
    columns = columnGroup.children()
    expect(columns.length).to.equal 6
    fn = (att) ->
      (a, b) ->
        a + ' ' + b.getAttribute(att)

    computedX = Array::reduce.call(columns, fn('x'), 'X')
    computedY = Array::reduce.call(columns, fn('y'), 'Y')
    computedH = Array::reduce.call(columns, fn('height'), 'H')
    expect(computedX).to.eql 'X 119 237 356 474 593 711'
    expect(computedY).to.eql 'Y 410 370 300 290 220 30'
    expect(computedH).to.eql 'H 40 80 150 160 230 420'
    i = 0

    while i < columns.length
      expect(columns[i].domElement.nodeName).to.equal 'rect'

      # BAH PUTAIN.
      expect(window.getComputedStyle(columns[i].domElement).getPropertyValue('fill-opacity')).to.equal '0.7'
      i++

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
    expect(columns.length).to.equal 6
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
    expect(computedX).to.eql 'X 119 237 356 474 593 711'
    expect(computedY).to.eql 'Y 0 370 300 290 220 30'
    expect(computedH).to.eql 'H 450 80 150 160 230 420'
    i = 0

    while i < columns.length
      expect(columns[i].domElement.nodeName).to.equal 'rect'
      expect(window.getComputedStyle(columns[i].domElement).getPropertyValue('fill-opacity')).to.equal expectedOpacities[i]
      i++
    return

  return
