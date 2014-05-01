describe 'line series', ->
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
      outerScope.options = series: [
        y: 'value'
        color: '#4682b4'
        thickness: '3px'
      ]

  it 'should properly configure y axis', ->
    ticks = element.childByClass('y axis').children('text')
    expect(ticks.length).to.equal 10
    expect(ticks[0].domElement.textContent).to.equal '0'
    expect(ticks[9].domElement.textContent).to.equal '45'

  it 'should create a group', ->
    content = element.childByClass('content')
    expect(content.children().length).to.equal 2
    lineGroup = content.children()[0]
    expect(lineGroup.getAttribute('class')).to.equal 'lineGroup series_0'
    expect(lineGroup.getAttribute('style').trim()).to.equal 'stroke: rgb(70, 130, 180);'

  it 'should draw dots', ->
    content = element.childByClass('content')
    dotsGroup = content.children()[1]
    expect(dotsGroup.domElement.nodeName).to.equal 'g'
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
    return

  it 'should draw a line', ->
    content = element.childByClass('content')
    linePath = content.childByClass('line')
    expect(linePath.getAttribute('class')).to.equal 'line'
    expect(linePath.getAttribute('style')).to.equal 'fill: none; stroke-width: 3px;'
    expect(linePath.getAttribute('d')).to.equal 'M0,410L162,370L324,300L486,290L648,220L810,30'
