describe 'event handling', ->
  beforeEach module 'n3-line-chart'
  beforeEach module 'testUtils'

  describe 'utils', ->
    n3utils = undefined

    beforeEach inject (_n3utils_) ->
      n3utils = _n3utils_

    it 'should create a dispatcher with event attrs', ->
      
      dispatch = n3utils.getEventDispatcher()

      expect(dispatch).to.have.property("focus")
      expect(dispatch).to.have.property("hover")
      expect(dispatch).to.have.property("click")

  describe 'rendering', ->
    element = undefined
    innerScope = undefined
    outerScope = undefined

    fakeMouse = undefined

    flushD3 = undefined

    beforeEach inject (n3utils, _fakeMouse_) ->
      flushD3 = ->
        now = Date.now
        Date.now = -> Infinity
        d3.timer.flush()
        Date.now = now

      fakeMouse = _fakeMouse_

      sinon.stub n3utils, 'getDefaultMargins', ->
        top: 20
        right: 50
        bottom: 30
        left: 50

      sinon.stub n3utils, 'getTextBBox', -> {width: 30}


    beforeEach inject (pepito) ->
      {element, innerScope, outerScope} = pepito.directive """
      <div>
        <linechart data='data' options='options' click='clicked' hover='hovered' focus='focused'></linechart>
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
          series: [
            {
              y: 'value'
              color: '#4682b4'
            }
            {
              y: 'x'
              axis: 'y2'
              type: 'column'
              color: '#4682b4'
            }
          ]
          tooltip: {mode: 'axes', interpolate: false}
        outerScope.clicked = (d, i) ->
          console.log('clicked')

      sinon.stub(d3, 'mouse', -> [0, 0])

    afterEach ->
      d3.mouse.restore()

    it 'should dispatch a click event when clicked on a dot', ->

      clicked = undefined
      hovered = undefined

      outerScope.$apply ->
        outerScope.options =
          series: [
            {y: 'value', color: '#4682b4'}
            {y: 'value', axis: 'y2', type: 'column', color: '#4682b4'}
          ]
          tooltip: {mode: 'axes'}
        outerScope.clicked = (d, i) ->
          console.log('clicked')
          clicked = [d, i]
        outerScope.hovered = (d, i) ->
          console.log('hovered')
          hovered = [d, i]

