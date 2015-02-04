describe 'with a second axis', ->
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
    computedTicks = ticks.map (t) -> t.domElement.textContent
    expect(computedTicks).to.eql([
      '-4', '-2', '0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22'
    ])

  it 'should draw two lines', ->
    content = element.childByClass('content')
    lines = element.childByClass('content').childrenByClass('line')
    expect(lines.length).to.equal(2)

    expect(lines[0].getAttribute('d')).to.equal 'M0,410L160,370L320,300L480,290L640,220L800,30'
    expect(lines[1].getAttribute('d')).to.equal 'M0,415L160,0L320,398L480,381L640,433L800,450'

  it 'should draw y area', ->
    areaGroup = element.childByClass('areaGroup series_0')
    expect(areaGroup.getAttribute('style')).to.equal null

    areaPath = areaGroup.childByClass('area')
    expect(areaPath.getAttribute('style').trim()).to.equal 'fill: rgb(70, 130, 180); opacity: 0.3;'
    expect(areaPath.getAttribute('d')).to.equal 'M0,410L160,370L320,300L480,290L640,220L800,30L800,450L640,450L480,450L320,450L160,450L0,450Z'

  it 'should draw y2 area', ->
    areaGroup = element.childByClass('areaGroup series_1')
    expect(areaGroup.getAttribute('style')).to.equal null

    areaPath = areaGroup.childByClass('area')
    expect(areaPath.getAttribute('style').trim()).to.equal 'fill: steelblue; opacity: 0.3;'
    expect(areaPath.getAttribute('d')).to.equal 'M0,415L160,0L320,398L480,381L640,433L800,450L800,381L640,381L480,381L320,381L160,381L0,381Z'

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
    expect(computedX).to.equal 'X 0 160 320 480 640 800'
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
    fn = (att) ->
      (a, b) ->
        a + ' ' + b.getAttribute(att)

    computedX = Array::reduce.call(dots, fn('cx'), 'X')
    computedY = Array::reduce.call(dots, fn('cy'), 'Y')
    expect(computedX).to.equal 'X 0 160 320 480 640 800'
    expect(computedY).to.equal 'Y 415 0 398 381 433 450'
    i = 0

    while i < dots.length
      expect(dots[i].domElement.nodeName).to.equal 'circle'
      i++

