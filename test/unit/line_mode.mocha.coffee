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
    expect(areaPath.getAttribute('d')).to.equal 'M0,410Q136,381,170,370C221,353.5,289,312,340,300S459,302,510,290S629,259,680,220Q714,194,850,30L850,450Q714,450,680,450C629,450,561,450,510,450S391,450,340,450S221,450,170,450Q136,450,0,450Z'

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
    expect(areaPath.getAttribute('d')).to.equal 'M0,410Q79.33333333333333,399.3333333333333,170,370C306,326,204,332,340,300S374,322,510,290S544,324,680,220Q770.6666666666666,150.66666666666669,850,30L850,450Q770.6666666666666,450,680,450C544,450,646,450,510,450S476,450,340,450S306,450,170,450Q79.33333333333333,450,0,450Z'

  it 'should draw an interpolated line', ->
    linePath = element.childByClass('line')
    expect(linePath.getAttribute('class')).to.equal 'line'
    expect(linePath.getAttribute('d')).to.equal 'M0,410Q136,381,170,370C221,353.5,289,312,340,300S459,302,510,290S629,259,680,220Q714,194,850,30'

  it 'should create a dots group with coordinates unchanged', ->
    dotsGroup = element.childByClass('dotGroup')
    dots = dotsGroup.children()
    expect(dots.length).to.equal 6
    fn = (att) ->
      (a, b) ->
        a + ' ' + b.getAttribute(att)

    computedX = Array::reduce.call(dots, fn('cx'), 'X')
    computedY = Array::reduce.call(dots, fn('cy'), 'Y')
    expect(computedX).to.eql 'X 0 170 340 510 680 850'
    expect(computedY).to.eql 'Y 410 370 300 290 220 30'
    i = 0

    while i < dots.length
      expect(dots[i].domElement.nodeName).to.equal 'circle'
      i++
