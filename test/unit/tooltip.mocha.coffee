describe 'tooltip', ->
  element = undefined
  innerScope = undefined
  outerScope = undefined

  fakeMouse = undefined

  tooltipSpy = undefined

  beforeEach module 'n3-line-chart'
  beforeEach module 'testUtils'

  beforeEach inject (n3utils, _fakeMouse_) ->
    fakeMouse = _fakeMouse_

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
    tooltipSpy = sinon.spy()

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
        axes: {x: {tooltipFormatter: tooltipSpy}}
        series: [
          {
            y: 'value'
            color: '#4682b4'
          }
          {
            y: 'value'
            axis: 'y2'
            type: 'column'
            color: '#4682b4'
          }
        ]
        addLineTooltips: true


  it 'should show/hide the tooltip when hovering/leaving a left axis dot', ->
    leftAxisDotGroup = element.childByClass('dotGroup series_0')

    xTooltip = element.childByClass('xTooltip')
    expect(xTooltip.getAttribute('id')).to.equal 'xTooltip'

    fakeMouse.hoverIn(leftAxisDotGroup.domElement)
    fakeMouse.hoverOut(leftAxisDotGroup.domElement)
    expect(tooltipSpy.callCount).to.equal(1)

  it 'should show/hide the tooltip when hovering/leaving a line', ->
    content = element.childByClass('content')
    linePath = content.childByClass('line')

    xTooltip = element.childByClass('xTooltip')
    expect(xTooltip.getAttribute('id')).to.equal 'xTooltip'
    
    fakeMouse.hoverMove(linePath.domElement)
    fakeMouse.hoverOut(linePath.domElement)
    expect(tooltipSpy.callCount).to.equal(2)

  it 'should work when no x-formatter is found', ->
    outerScope.$apply ->
      outerScope.options = series: [
        {
          y: 'value'
          color: '#4682b4'
        }
        {
          y: 'value'
          axis: 'y2'
          color: '#4682b4'
          type: 'column'
        }
      ]

    leftAxisDotGroup = element.childByClass('dotGroup series_0')

    xTooltip = element.childByClass('xTooltip')
    expect(xTooltip.getAttribute('id')).to.equal 'xTooltip'

    fakeMouse.hoverIn(leftAxisDotGroup.domElement)
    fakeMouse.hoverOut(leftAxisDotGroup.domElement)

  it 'should show/hide the tooltip when hovering/leaving a right axis column', ->
    rightAxisColumnGroup = element.childByClass('columnGroup series_1')
    xTooltip = element.childByClass('xTooltip')

    fakeMouse.hoverIn(rightAxisColumnGroup.domElement)
    fakeMouse.hoverOut(rightAxisColumnGroup.domElement)


