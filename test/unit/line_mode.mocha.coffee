describe 'lineMode set to cardinal', ->
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
        {x: 0, value: 4}
        {x: 1, value: 8}
        {x: 2, value: 15}
        {x: 3, value: 16}
        {x: 4, value: 23}
        {x: 5, value: 42}
      ]
      outerScope.options =
        lineMode: 'cardinal'
        series: [
          y: 'value'
          color: '#4682b4'
          type: 'area'
        ]

  it 'should draw an interpolated area', ->
    content = element.childByClass('content')
    areaGroup = content.childByClass('areaGroup')
    expect(areaGroup.getAttribute('style')).to.equal null
    areaPath = areaGroup.childByClass('area')
    expect(areaPath.getAttribute('style').trim()).to.equal 'fill: rgb(70, 130, 180); opacity: 0.3;'
    expect(areaPath.getAttribute('d')).to.equal 'M0,410Q132.8,381,166,370C215.8,353.5,282.2,312,332,300S448.2,302,498,290S614.2,259,664,220Q697.2,194,830,30L830,450Q697.2,450,664,450C614.2,450,547.8,450,498,450S381.8,450,332,450S215.8,450,166,450Q132.8,450,0,450Z'

  it 'should draw an interpolated area regarding the line tension', ->
    outerScope.$apply ->
      outerScope.options =
        lineMode: 'cardinal'
        tension: 0.2
        series: [
          y: 'value'
          color: '#4682b4'
          type: 'area'
        ]

    content = element.childByClass('content')
    areaGroup = content.childByClass('areaGroup')
    expect(areaGroup.getAttribute('style')).to.equal null
    areaPath = areaGroup.childByClass('area')
    expect(areaPath.getAttribute('style').trim()).to.equal 'fill: rgb(70, 130, 180); opacity: 0.3;'
    expect(areaPath.getAttribute('d')).to.equal 'M0,410Q77.46666666666665,399.3333333333333,166,370C298.8,326,199.2,332,332,300S365.2,322,498,290S531.2,324,664,220Q752.5333333333333,150.66666666666669,830,30L830,450Q752.5333333333333,450,664,450C531.2,450,630.8,450,498,450S464.8,450,332,450S298.8,450,166,450Q77.46666666666665,450,0,450Z'

  it 'should draw an interpolated line', ->
    linePath = element.childByClass('line')
    expect(linePath.getAttribute('class')).to.equal 'line'
    expect(linePath.getAttribute('d')).to.equal 'M0,410Q132.8,381,166,370C215.8,353.5,282.2,312,332,300S448.2,302,498,290S614.2,259,664,220Q697.2,194,830,30'

  it 'should create a dots group with coordinates unchanged', ->
    dotsGroup = element.childByClass('dotGroup')
    dots = dotsGroup.children()
    expect(dots.length).to.equal 6
    fn = (att) ->
      (a, b) ->
        a + ' ' + b.getAttribute(att)

    computedX = Array::reduce.call(dots, fn('cx'), 'X')
    computedY = Array::reduce.call(dots, fn('cy'), 'Y')
    expect(computedX).to.eql 'X 0 166 332 498 664 830'
    expect(computedY).to.eql 'Y 410 370 300 290 220 30'
    i = 0

    while i < dots.length
      expect(dots[i].domElement.nodeName).to.equal 'circle'
      i++
