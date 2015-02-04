describe 'tooltip', ->
  element = undefined
  innerScope = undefined
  outerScope = undefined

  fakeMouse = undefined

  flushD3 = undefined
  checkVisibilityOf = undefined

  beforeEach module 'n3-line-chart'
  beforeEach module 'testUtils'

  beforeEach inject (n3utils, _fakeMouse_) ->
    flushD3 = ->
      now = Date.now
      Date.now = -> Infinity
      d3.timer.flush()
      Date.now = now

    sinon.stub n3utils, 'getTextBBox', -> {width: 30}

    checkVisibilityOf = (args) ->
      flushD3()
      args.forEach (axis) ->
        if element.childByClass("#{axis}Tooltip").getAttribute('opacity') isnt '1'
          console.warn "#{axis}Tooltip is not visible, but it should"
        expect(element.childByClass("#{axis}Tooltip").getAttribute('opacity')).to.equal('1')

      ['x', 'y', 'y2'].forEach (axis) ->
        if args.indexOf(axis) is -1
          if element.childByClass("#{axis}Tooltip").getAttribute('opacity') isnt '0'
            console.warn "#{axis}Tooltip is visible, but it shouldn't"
          expect(element.childByClass("#{axis}Tooltip").getAttribute('opacity')).to.equal('0')


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
        axes: {}
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
        tooltip: {mode: 'axes', interpolate: true}


  it 'should show/hide the tooltip when hovering/leaving a left axis dot', ->
    leftAxisDotGroup = element.childByClass('dotGroup series_0')

    checkVisibilityOf([])

    fakeMouse.hoverIn(leftAxisDotGroup.domElement)
    checkVisibilityOf(['x', 'y'])

    fakeMouse.hoverOut(leftAxisDotGroup.domElement)
    checkVisibilityOf([])

  it 'should show/hide the tooltip when moving over/leaving a line', ->
    content = element.childByClass('content')
    linePath = content.childByClass('line')

    checkVisibilityOf([])
    fakeMouse.mouseMove(linePath.domElement)
    checkVisibilityOf(['x', 'y'])

    fakeMouse.hoverOut(linePath.domElement)
    checkVisibilityOf([])

  describe 'scrubber mode', ->
    beforeEach ->
      outerScope.$apply ->
        outerScope.options = {
          series: [
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
          tooltip: {mode: 'scrubber', interpolate: false}
        }

    it 'should create a glass', ->
      expect(element.childByClass('glass')).not.to.equal(undefined)

    it 'should change the legend on mouse over', inject (fakeMouse) ->
      glass = element.childByClass('glass')

      fakeMouse.hoverIn(glass.domElement)

  it 'should compute the closest abscissa', inject (n3utils) ->
    v = n3utils.getClosestPoint([
      {x: 0}
      {x: 1}
      {x: 2}
      {x: 4}
      {x: 5}
    ], 3.1)

    expect(v).to.eql({x: 4})

  it 'should show/hide the tooltip when hovering/leaving a right axis column', ->
    rightAxisColumnGroup = element.childByClass('columnGroup series_1')

    checkVisibilityOf([])

    fakeMouse.hoverIn(rightAxisColumnGroup.domElement)
    checkVisibilityOf(['x', 'y2'])

    fakeMouse.hoverOut(rightAxisColumnGroup.domElement)
    checkVisibilityOf([])
