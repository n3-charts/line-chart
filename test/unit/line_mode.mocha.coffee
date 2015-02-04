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
    expect(areaPath.getAttribute('d')).to.equal 'M0,410Q128,381,160,370C208,353.5,272,312,320,300S432,302,480,290S592,259,640,220Q672,194,800,30L800,450Q672,450,640,450C592,450,528,450,480,450S368,450,320,450S208,450,160,450Q128,450,0,450Z'

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
    expect(areaPath.getAttribute('d')).to.equal 'M0,410Q74.66666666666667,399.3333333333333,160,370C288,326,192,332,320,300S352,322,480,290S512,324,640,220Q725.3333333333334,150.66666666666669,800,30L800,450Q725.3333333333334,450,640,450C512,450,608,450,480,450S448,450,320,450S288,450,160,450Q74.66666666666667,450,0,450Z'

  it 'should draw an interpolated line', ->
    linePath = element.childByClass('line')
    expect(linePath.getAttribute('class')).to.equal 'line'
    expect(linePath.getAttribute('d')).to.equal 'M0,410Q128,381,160,370C208,353.5,272,312,320,300S432,302,480,290S592,259,640,220Q672,194,800,30'

  it 'should create a dots group with coordinates unchanged', ->
    dotsGroup = element.childByClass('dotGroup')
    dots = dotsGroup.children()
    expect(dots.length).to.equal 6
    fn = (att) ->
      (a, b) ->
        a + ' ' + b.getAttribute(att)

    computedX = Array::reduce.call(dots, fn('cx'), 'X')
    computedY = Array::reduce.call(dots, fn('cy'), 'Y')
    expect(computedX).to.eql 'X 0 160 320 480 640 800'
    expect(computedY).to.eql 'Y 410 370 300 290 220 30'
    i = 0

    while i < dots.length
      expect(dots[i].domElement.nodeName).to.equal 'circle'
      i++
