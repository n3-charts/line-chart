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
      expect(dispatch).to.have.property("toggle")

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
        <linechart
          data='data'
          options='options'
          on-click='clicked'
          on-hover='hovered'
          on-focus='focused'
          on-toggle='toggled'
        ></linechart>
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

      sinon.stub(d3, 'mouse', -> [0, 0])

    afterEach ->
      d3.mouse.restore()

    it 'should dispatch a click event when clicked on a dot', ->

      clicked = undefined

      outerScope.$apply ->
        outerScope.options =
          series: [
            {y: 'value', color: '#4682b4'}
            {y: 'value', axis: 'y2', type: 'column', color: '#4682b4'}
          ]
          tooltip: {mode: 'axes'}
        outerScope.clicked = (d, i) ->
          clicked = [d, i]

      dotGroup = element.childByClass('dotGroup')

      dotGroup.children()[0].click()
      expect(clicked[0].x).to.equal(0)
      expect(clicked[0].y).to.equal(4)
      expect(clicked[1]).to.equal(0)

      dotGroup.children()[1].click()
      expect(clicked[0].x).to.equal(1)
      expect(clicked[0].y).to.equal(8)
      expect(clicked[1]).to.equal(1)

    it 'should dispatch a click event when clicked on a column', ->

      clicked = undefined

      outerScope.$apply ->
        outerScope.options =
          series: [
            {y: 'value', color: '#4682b4'}
            {y: 'value', axis: 'y2', type: 'column', color: '#4682b4'}
          ]
          tooltip: {mode: 'axes'}
        outerScope.clicked = (d, i) ->
          clicked = [d, i]

      columnGroup = element.childByClass('columnGroup')

      columnGroup.children()[0].click()
      expect(clicked[0].x).to.equal(0)
      expect(clicked[0].y).to.equal(4)
      expect(clicked[1]).to.equal(0)

      columnGroup.children()[1].click()
      expect(clicked[0].x).to.equal(1)
      expect(clicked[0].y).to.equal(8)
      expect(clicked[1]).to.equal(1)

    it 'should dispatch a hover event when hovering over a dot', ->

      hovered = undefined

      outerScope.$apply ->
        outerScope.options =
          series: [
            {y: 'value', color: '#4682b4'}
            {y: 'value', axis: 'y2', type: 'column', color: '#4682b4'}
          ]
          tooltip: {mode: 'axes'}
        outerScope.hovered = (d, i) ->
          hovered = [d, i]

      dotGroup = element.childByClass('dotGroup')

      fakeMouse.hoverIn(dotGroup.children()[0].domElement)
      expect(hovered[0].x).to.equal(0)
      expect(hovered[0].y).to.equal(4)
      expect(hovered[1]).to.equal(0)

      fakeMouse.hoverIn(dotGroup.children()[1].domElement)
      expect(hovered[0].x).to.equal(1)
      expect(hovered[0].y).to.equal(8)
      expect(hovered[1]).to.equal(1)

    it 'should dispatch a hover event when hovering over a column', ->

      hovered = undefined

      outerScope.$apply ->
        outerScope.options =
          series: [
            {y: 'value', color: '#4682b4'}
            {y: 'value', axis: 'y2', type: 'column', color: '#4682b4'}
          ]
          tooltip: {mode: 'axes'}
        outerScope.hovered = (d, i) ->
          hovered = [d, i]

      columnGroup = element.childByClass('columnGroup')

      fakeMouse.hoverIn(columnGroup.children()[0].domElement)
      expect(hovered[0].x).to.equal(0)
      expect(hovered[0].y).to.equal(4)
      expect(hovered[1]).to.equal(0)

      fakeMouse.hoverIn(columnGroup.children()[1].domElement)
      expect(hovered[0].x).to.equal(1)
      expect(hovered[0].y).to.equal(8)
      expect(hovered[1]).to.equal(1)

    it 'should dispatch a focus event when scrubber is displayed', ->

      focused = []

      outerScope.$apply ->
        outerScope.options =
          series: [
            {y: 'value', color: '#4682b4'}
            {y: 'value', axis: 'y2', type: 'column', color: '#4682b4'}
          ]
          tooltip: {mode: 'scrubber'}
        outerScope.focused = (d, i) ->
          focused.push([d, i])

      glass = element.childByClass('glass')

      fakeMouse.hoverIn(glass)
      fakeMouse.mouseMove(glass)
      flushD3()

      expect(focused[0][0].x).to.equal(focused[1][0].x)
      expect(focused[0][1]).to.equal(focused[0][1])

    it 'should dispatch a toggle event when clicked on a legend', ->

      clicked = undefined

      outerScope.$apply ->
        outerScope.options =
          series: [
            {y: 'value', color: '#4682b4'}
            {y: 'value', axis: 'y2', type: 'column', color: '#4682b4', visible: false}
          ]
          tooltip: {mode: 'axes'}
        outerScope.toggled = (d, i, visibility) ->
          clicked = [d, i, visibility]

      firstLegendItem = element.childrenByClass('legendItem')[0]
      secondLegendItem = element.childrenByClass('legendItem')[1]

      firstLegendItem.click()
      expect(clicked[1]).to.equal(0)
      expect(clicked[2]).to.equal(false)

      firstLegendItem.click()
      expect(clicked[1]).to.equal(0)
      expect(clicked[2]).to.equal(true)

      secondLegendItem.click()
      expect(clicked[1]).to.equal(1)
      expect(clicked[2]).to.equal(true)
