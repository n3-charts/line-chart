describe 'lineMode set to cardinal', ->
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
    expect(areaPath.getAttribute('d')).to.equal 'M0,410Q129.6,381,162,370C210.60000000000002,353.5,275.4,312,324,300S' + '437.4,302,486,290S599.4,259,648,220Q680.4,194,810,30L810,450Q680.4,4' + '50,648,450C599.4,450,534.6,450,486,450S372.6,450,324,450S210.6000000' + '0000002,450,162,450Q129.6,450,0,450Z'

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
    expect(areaPath.getAttribute('d')).to.equal 'M0,410Q75.60000000000001,399.3333333333333,162,370C291.6,326,194.4,3' + '32,324,300S356.4,322,486,290S518.4,324,648,220Q734.4,150.66666666666' + '669,810,30L810,450Q734.4,450,648,450C518.4,450,615.6,450,486,450S453' + '.6,450,324,450S291.6,450,162,450Q75.60000000000001,450,0,450Z'

  it 'should draw an interpolated line', ->
    linePath = element.childByClass('line')
    expect(linePath.getAttribute('class')).to.equal 'line'
    expect(linePath.getAttribute('d')).to.equal 'M0,410Q129.6,381,162,370C210.60000000000002,353.5,275.4,312,324,300S' + '437.4,302,486,290S599.4,259,648,220Q680.4,194,810,30'

  it 'should create a dots group with coordinates unchanged', ->
    dotsGroup = element.childByClass('dotGroup')
    dots = dotsGroup.children()
    expect(dots.length).to.equal 6
    fn = (att) ->
      (a, b) ->
        a + ' ' + b.getAttribute(att)

    computedX = Array::reduce.call(dots, fn('cx'), 'X')
    computedY = Array::reduce.call(dots, fn('cy'), 'Y')
    expect(computedX).to.eql 'X 0 162 324 486 648 810'
    expect(computedY).to.eql 'Y 410 370 300 290 220 30'
    i = 0

    while i < dots.length
      expect(dots[i].domElement.nodeName).to.equal 'circle'
      i++
