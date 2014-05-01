describe 'with a second axis', ->
  element = undefined
  innerScope = undefined
  outerScope = undefined

  beforeEach module 'n3-charts.linechart'
  beforeEach module 'testUtils'

  beforeEach inject (n3utils) ->
    sinon.stub n3utils, 'getDefaultMargins', ->
      top: 20
      right: 50
      bottom: 30
      left: 50

  beforeEach inject (pepito) ->
    {element, innerScope, outerScope} = pepito.directive """
    <div>
      <linechart data='data' options='options'></linechart>
    </div>
    """

  beforeEach ->
    outerScope.$apply ->
      outerScope.data = [
        {x: 0, value: 4, foo: -2}
        {x: 1, value: 8, foo: 22}
        {x: 2, value: 15, foo: -1}
        {x: 3, value: 16, foo: 0}
        {x: 4, value: 23, foo: -3}
        {x: 5, value: 42, foo: -4}
      ]
      outerScope.options = series: [
        {
          axis: 'y'
          y: 'value'
          color: '#4682b4'
          type: 'area'
        }
        {
          axis: 'y2'
          y: 'foo'
          color: 'steelblue'
          type: 'area'
        }
      ]

  it 'should configure y axis only with y series', ->
    ticks = element.childByClass('y axis').children('text')
    expect(ticks.length).to.equal 10
    expect(ticks[0].domElement.textContent).to.equal '0'
    expect(ticks[9].domElement.textContent).to.equal '45'

  it 'should properly configure y2 axis', ->
    ticks = element.childByClass('y2 axis').children('text')
    expect(ticks.length).to.equal 14
    expect(ticks[0].domElement.textContent).to.equal '0'
    expect(ticks[10].domElement.textContent).to.equal '16'

  it 'should draw two lines', ->
    content = element.childByClass('content')
    lines = element.childByClass('content').childrenByClass('line')
    expect(lines.length).to.equal(2)

    expect(lines[0].getAttribute('d')).to.equal 'M0,410L164,370L328,300L492,290L656,220L820,30'
    expect(lines[1].getAttribute('d')).to.equal 'M0,415L164,0L328,398L492,381L656,433L820,450'

  it 'should draw y area', ->
    areaGroup = element.childByClass('areaGroup series_0')
    expect(areaGroup.getAttribute('style')).to.equal null

    areaPath = areaGroup.childByClass('area')
    expect(areaPath.getAttribute('style').trim()).to.equal 'fill: rgb(70, 130, 180); opacity: 0.3;'
    expect(areaPath.getAttribute('d')).to.equal 'M0,410L164,370L328,300L492,290L656,220L820,30L820,450L656,450L49' + '2,450L328,450L164,450L0,450Z'

  it 'should draw y2 area', ->
    areaGroup = element.childByClass('areaGroup series_1')
    expect(areaGroup.getAttribute('style')).to.equal null

    areaPath = areaGroup.childByClass('area')
    expect(areaPath.getAttribute('style').trim()).to.equal 'fill: steelblue; opacity: 0.3;'
    expect(areaPath.getAttribute('d')).to.equal 'M0,415L164,0L328,398L492,381L656,433L820,450L820,381L656,' + '381L492,381L328,381L164,381L0,381Z'

  it 'should draw y axis dots', ->
    leftDotsGroup = element.childByClass('dotGroup series_0')
    expect(leftDotsGroup.domElement.nodeName).to.equal 'g'

    dots = leftDotsGroup.children()
    expect(dots.length).to.equal 6
    fn = (att) ->
      (a, b) ->
        a + ' ' + b.getAttribute(att)

    computedX = Array::reduce.call(dots, fn('cx'), 'X')
    computedY = Array::reduce.call(dots, fn('cy'), 'Y')
    expect(computedX).to.equal 'X 0 164 328 492 656 820'
    expect(computedY).to.equal 'Y 410 370 300 290 220 30'
    i = 0

    while i < dots.length
      expect(dots[i].domElement.nodeName).to.equal 'circle'
      i++

  it 'should draw y2 axis dots', ->
    rightDotsGroup = element.childByClass('dotGroup series_1')
    expect(rightDotsGroup.domElement.nodeName).to.equal 'g'

    dots = rightDotsGroup.children()
    expect(dots.length).to.equal 6
    expectedCoordinates = [
      {x: '0', y: '415'}
      {x: '164', y: '0'}
      {x: '328', y: '398'}
      {x: '492', y: '381'}
      {x: '656', y: '433'}
      {x: '820', y: '450'}
    ]
    i = 0

    while i < dots.length
      expect(dots[i].domElement.nodeName).to.equal 'circle'
      expect(dots[i].getAttribute('cx')).to.equal expectedCoordinates[i].x
      expect(dots[i].getAttribute('cy')).to.equal expectedCoordinates[i].y
      i++

