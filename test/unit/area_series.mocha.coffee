describe 'area series', ->
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
      <linechart data="data" options="options"></linechart>
    </div>
    """

  beforeEach ->
    outerScope.$apply ->
      outerScope.data = [
        {x: 0, value: 4}
        {x: 1, value: 8}
        {x: 2, value: 15}
        {x: 3, value: 16}
        {x: 4, value: 23}
        {x: 5, value: 42}
      ]
      outerScope.options = series: [
        y: 'value'
        color: '#4682b4'
        type: 'area'
      ]

  it 'should properly configure y axis', ->
    ticks = element.childByClass('y axis').children('text')
    expect(ticks.length).to.equal 10
    expect(ticks[0].domElement.textContent).to.equal '0'
    expect(ticks[9].domElement.textContent).to.equal '45'

  it 'should properly configure x axis', ->
    ticks = element.childByClass('x axis').children('text')
    expect(ticks.length).to.equal 11
    expect(ticks[0].domElement.textContent).to.equal '0.0'
    expect(ticks[10].domElement.textContent).to.equal '5.0'

  it 'should create 3 elements', ->
    content = element.childByClass('content').domElement
    expect(content.childNodes.length).to.equal 3

  it 'should create an area group', ->
    areaGroup = element.childByClass('areaGroup series_0')
    expect(areaGroup.getStyle()).to.equal null
    areaPath = areaGroup.domElement.childNodes[0]
    expect(areaPath.getAttribute('style').trim()).to.equal 'fill: rgb(70, 130, 180); opacity: 0.3;'
    expect(areaPath.getAttribute('class')).to.equal 'area'
    expect(areaPath.getAttribute('d')).to.equal 'M0,410L160,370L320,300L480,290L640,220L800,30L800,450L640,450L480,450L320,450L160,450L0,450Z'

  it 'should create stripes pattern when told so', ->
    outerScope.$apply ->
      outerScope.options = series: [
        y: 'value'
        color: '#4582b4'
        type: 'area'
        striped: true
      ]

    patterns = element.childByClass('patterns')
    expect(patterns.domElement.childNodes.length).to.equal 2
    pattern = patterns.domElement.childNodes[0]
    expect(pattern.getAttribute('id')).to.equal 'areaPattern_0'
    patternGroup = pattern.childNodes[0]
    expect(patternGroup.getAttribute('style').trim()).to.equal 'fill: rgb(69, 130, 180); fill-opacity: 0.3;'

  it 'should link pattern to fill style', ->
    outerScope.$apply ->
      outerScope.options = series: [
        y: 'value'
        color: '#4582b4'
        type: 'area'
        striped: true
      ]

    areaGroup = element.childByClass('areaGroup series_0')
    expect(areaGroup.getStyle()).to.equal null
    areaPath = areaGroup.child('path')
    expect(areaPath.getStyle().trim()).to.equal 'fill: url("#areaPattern_0") none; opacity: 1;'
    expect(areaPath.hasClass('area')).to.equal true
    expect(areaPath.getAttribute('d')).to.equal 'M0,410L160,370L320,300L480,290L640,220L800,30L800,450L640,450L480,450L320,450L160,450L0,450Z'

  it 'should create a line group', ->
    lineGroup = element.childByClass('lineGroup series_0')
    expect(lineGroup.getStyle().trim()).to.equal 'stroke: rgb(70, 130, 180);'

  it 'should create a dots group', ->
    dotsGroup = element.childByClass('dotGroup series_0')

    expect(dotsGroup.domElement.nodeName).to.equal 'g'
    dots = dotsGroup.domElement.childNodes
    expect(dots.length).to.equal 6
    expectedX = 'X 0 160 320 480 640 800'
    expectedY = 'Y 410 370 300 290 220 30'
    computedX = Array::reduce.call(dots, (a, b) ->
      a + ' ' + b.getAttribute('cx')
    , 'X')
    computedY = Array::reduce.call(dots, (a, b) ->
      a + ' ' + b.getAttribute('cy')
    , 'Y')
    i = 0

    while i < dots.length
      expect(dots[i].nodeName).to.equal 'circle'
      i++
    expect(computedX).to.equal expectedX
    expect(computedY).to.equal expectedY


