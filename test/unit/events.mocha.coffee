describe 'event handling', ->
  n3utils = undefined
  beforeEach module 'n3-line-chart'
  beforeEach module 'testUtils'
  beforeEach inject (_n3utils_) ->
    n3utils = _n3utils_

  describe 'utils', ->

    it 'should create a dispatcher with event attrs', ->

      dispatch = n3utils.getEventDispatcher()

      expect(dispatch).to.have.property("focus")
      expect(dispatch).to.have.property("hover")
      expect(dispatch).to.have.property("click")
      expect(dispatch).to.have.property("toggle")
      expect(dispatch).to.have.property("mouseenter")
      expect(dispatch).to.have.property("mouseover")
      expect(dispatch).to.have.property("mouseout")

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
          on-mouseenter='mouseentered'
          on-mouseover='mouseovered'
          on-mouseout='mouseouted'
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

      fakeMouse.position([0, 0])

    afterEach ->
      d3.mouse.restore()

    it 'should dispatch a focus event when scrubber is displayed', ->
      focus = sinon.spy((d, i, pos, series, raw) -> 'pouet')

      outerScope.$apply ->
        outerScope.options =
          series: [{y: 'value'}]
          tooltip: {mode: 'scrubber'}
        outerScope.focused = focus

      dotGroup = element.childByClass('dotGroup')
      dot = dotGroup.children()[0]
      x = +dot.getAttribute("cx") + outerScope.options.margin.left
      y = +dot.getAttribute("cy") + outerScope.options.margin.top
      data = n3utils.getDataPerSeries(outerScope.data, outerScope.options)
      pos = [x, y]
      posInverted = [data[0].values[0].x, data[0].values[0].y]
      args = [data[0].values[0], 0, posInverted, data[0], data[0].values[0].raw]

      fakeMouse.position(pos)
      fakeMouse.mouseMove(dot.domElement)
      expect(focus.calledWith.apply(focus, args)).to.equal(true)

    it 'should dispatch a toggle event when clicked on a legend', ->
      cb = sinon.spy((d, i, visibility) -> 'pouet')

      outerScope.$apply ->
        outerScope.options =
          series: [
            {y: 'value', color: '#4682b4'}
            {y: 'value', axis: 'y2', type: 'column', color: '#4682b4', visible: false}
          ]
        outerScope.toggled = cb

      firstLegendItem = element.childrenByClass('legendItem')[0]
      secondLegendItem = element.childrenByClass('legendItem')[1]

      firstLegendItem.click()
      expect(cb.calledWith(outerScope.options.series[0], 0, false)).to.equal(true)

      firstLegendItem.click()
      expect(cb.calledWith(outerScope.options.series[0], 0, true)).to.equal(true)

      secondLegendItem.click()
      expect(cb.calledWith(outerScope.options.series[1], 1, true)).to.equal(true)

    it 'should handle x zoom events', ->

      outerScope.$apply ->
        outerScope.options =
          margin:
            {left: 0, bottom: 0, top: 0, right: 0}
          axes:
            x: {zoomable: true}
          series: [
            {y: 'value', type: 'column'}
          ]

      columnGroup = element.childByClass('columnGroup')
      expect(columnGroup.children()[0].getAttribute('x')).to.equal('129')
      expect(columnGroup.children()[0].getAttribute('y')).to.equal('456')
      expect(columnGroup.children()[0].getAttribute('width')).to.equal('123')
      expect(columnGroup.children()[0].getAttribute('height')).to.equal('44')

      fakeMouse.wheel(columnGroup.domElement, 0, -10)

      columnGroup = element.childByClass('columnGroup')
      expect(columnGroup.children()[0].getAttribute('x')).to.equal('130')
      expect(columnGroup.children()[0].getAttribute('y')).to.equal('456')
      expect(columnGroup.children()[0].getAttribute('width')).to.equal('125')
      expect(columnGroup.children()[0].getAttribute('height')).to.equal('44')

    it 'should handle x and y zoom events', ->

      outerScope.$apply ->
        outerScope.options =
          margin:
            {left: 0, bottom: 0, top: 0, right: 0}
          axes:
            x: {zoomable: true}
            y: {zoomable: true}
          series: [
            {y: 'value', type: 'column'}
          ]

      columnGroup = element.childByClass('columnGroup')
      expect(columnGroup.children()[0].getAttribute('x')).to.equal('129')
      expect(columnGroup.children()[0].getAttribute('y')).to.equal('456')
      expect(columnGroup.children()[0].getAttribute('width')).to.equal('123')
      expect(columnGroup.children()[0].getAttribute('height')).to.equal('44')

      fakeMouse.wheel(columnGroup.domElement, 0, -10)

      columnGroup = element.childByClass('columnGroup')
      expect(columnGroup.children()[0].getAttribute('x')).to.equal('130')
      expect(columnGroup.children()[0].getAttribute('y')).to.equal('462')
      expect(columnGroup.children()[0].getAttribute('width')).to.equal('125')
      expect(columnGroup.children()[0].getAttribute('height')).to.equal('38')

    it 'should ignore zoom events by default', ->

      getColumn = -> element.childByClass('columnGroup').children()[0]

      outerScope.$apply ->
        outerScope.options =
          margin:
            {left: 0, bottom: 0, top: 0, right: 0}
          axes:
            x: {zoomable: false}
            y: {zoomable: false}
          series: [
            {y: 'value', type: 'column'}
          ]

      originalPosition =
        x: getColumn().getAttribute('x')
        y: getColumn().getAttribute('y')

      columnGroup = element.childByClass('columnGroup')
      fakeMouse.wheel(columnGroup.domElement, 0, -10)

      expect(getColumn().getAttribute('x')).to.equal(originalPosition.x)
      expect(getColumn().getAttribute('y')).to.equal(originalPosition.y)

    describe 'tooltip mode scrubber', ->

      it 'should dispatch a click event when clicked on a dot', ->
        clicked = sinon.spy((d, i, series, raw) -> 'pouet')

        outerScope.$apply ->
          outerScope.options =
            series: [
              {y: 'value', color: '#4682b4'}
              {y: 'value', axis: 'y2', type: 'column', color: '#4682b4'}
            ]
            tooltip: {mode: 'scrubber'}
          outerScope.clicked = clicked

        dotGroup = element.childByClass('dotGroup')
        data = n3utils.getDataPerSeries(outerScope.data, outerScope.options)
        args = [data[0].values[0], 0, data[0], data[0].values[0].raw]

        dotGroup.children()[0].click()
        expect(clicked.calledWith.apply(clicked, args)).to.equal(true)

      it 'should dispatch a click event when clicked on a column', ->
        clicked = sinon.spy((d, i, series, raw) -> 'pouet')

        outerScope.$apply ->
          outerScope.options =
            series: [
              {y: 'value', color: '#4682b4'}
              {y: 'value', axis: 'y2', type: 'column', color: '#4682b4'}
            ]
            tooltip: {mode: 'scrubber'}
          outerScope.clicked = clicked

        columnGroup = element.childByClass('columnGroup')
        data = n3utils.getDataPerSeries(outerScope.data, outerScope.options)
        args = [data[1].values[0], 0, data[1], data[1].values[0].raw]

        columnGroup.children()[0].click()
        expect(clicked.calledWith.apply(clicked, args)).to.equal(true)

      it 'should dispatch a hover event when hovering over a dot', ->
        hovered = sinon.spy((d, i, series, raw) -> 'pouet')

        outerScope.$apply ->
          outerScope.options =
            series: [
              {y: 'value', color: '#4682b4'}
              {y: 'value', axis: 'y2', type: 'column', color: '#4682b4'}
            ]
            tooltip: {mode: 'scrubber'}
          outerScope.hovered = hovered

        dotGroup = element.childByClass('dotGroup')
        data = n3utils.getDataPerSeries(outerScope.data, outerScope.options)
        args = [data[0].values[0], 0, data[0], data[0].values[0].raw]

        fakeMouse.hoverIn(dotGroup.children()[0].domElement)
        expect(hovered.calledWith.apply(hovered, args)).to.equal(true)

      it 'should dispatch a hover event when hovering over a column', ->
        hovered = sinon.spy((d, i, series, raw) -> 'pouet')

        outerScope.$apply ->
          outerScope.options =
            series: [
              {y: 'value', color: '#4682b4'}
              {y: 'value', axis: 'y2', type: 'column', color: '#4682b4'}
            ]
            tooltip: {mode: 'scrubber'}
          outerScope.hovered = hovered

        columnGroup = element.childByClass('columnGroup')
        data = n3utils.getDataPerSeries(outerScope.data, outerScope.options)
        args = [data[1].values[0], 0, data[1], data[1].values[0].raw]

        fakeMouse.hoverIn(columnGroup.children()[0].domElement)
        expect(hovered.calledWith.apply(hovered, args)).to.equal(true)

      it 'should dispatch a mouseenter events when hovering over a dot', ->
        mouseenter = sinon.spy((d, i, series, raw) -> 'pouet')

        outerScope.$apply ->
          outerScope.options =
            series: [{y: 'value'}]
            tooltip: {mode: 'scrubber'}
          outerScope.mouseentered = mouseenter

        dotGroup = element.childByClass('dotGroup')
        data = n3utils.getDataPerSeries(outerScope.data, outerScope.options)
        args = [data[0].values[0], 0, data[0], data[0].values[0].raw]

        fakeMouse.mouseEnter(dotGroup.children()[0].domElement)
        expect(mouseenter.calledWith.apply(mouseenter, args)).to.equal(true)

      it 'should dispatch a mouseover events when hovering over a dot', ->
        mouseover = sinon.spy((d, i, series, raw) -> 'pouet')

        outerScope.$apply ->
          outerScope.options =
            series: [{y: 'value'}]
            tooltip: {mode: 'scrubber'}
          outerScope.mouseovered = mouseover

        dotGroup = element.childByClass('dotGroup')
        data = n3utils.getDataPerSeries(outerScope.data, outerScope.options)
        args = [data[0].values[0], 0, data[0], data[0].values[0].raw]

        fakeMouse.mouseOver(dotGroup.children()[0].domElement)
        expect(mouseover.calledWith.apply(mouseover, args)).to.equal(true)

      it 'should dispatch a mouseout events when hovering over a dot', ->
        mouseout = sinon.spy((d, i, series, raw) -> 'pouet')

        outerScope.$apply ->
          outerScope.options =
            series: [{y: 'value'}]
            tooltip: {mode: 'scrubber'}
          outerScope.mouseouted = mouseout

        dotGroup = element.childByClass('dotGroup')
        data = n3utils.getDataPerSeries(outerScope.data, outerScope.options)
        args = [data[0].values[0], 0, data[0], data[0].values[0].raw]

        fakeMouse.mouseOut(dotGroup.children()[0].domElement)
        expect(mouseout.calledWith.apply(mouseout, args)).to.equal(true)

    describe 'tooltip mode axes', ->

      it 'should dispatch a click event when clicked on a dot', ->
        clicked = sinon.spy((d, i, series, raw) -> 'pouet')

        outerScope.$apply ->
          outerScope.options =
            series: [
              {y: 'value', color: '#4682b4'}
              {y: 'value', axis: 'y2', type: 'column', color: '#4682b4'}
            ]
            tooltip: {mode: 'axes'}
          outerScope.clicked = clicked

        dotGroup = element.childByClass('dotGroup')
        data = n3utils.getDataPerSeries(outerScope.data, outerScope.options)
        args = [data[0].values[0], 0, data[0], data[0].values[0].raw]

        dotGroup.children()[0].click()
        expect(clicked.calledWith.apply(clicked, args)).to.equal(true)

      it 'should dispatch a click event when clicked on a column', ->
        clicked = sinon.spy((d, i, series, raw) -> 'pouet')

        outerScope.$apply ->
          outerScope.options =
            series: [
              {y: 'value', color: '#4682b4'}
              {y: 'value', axis: 'y2', type: 'column', color: '#4682b4'}
            ]
            tooltip: {mode: 'axes'}
          outerScope.clicked = clicked

        columnGroup = element.childByClass('columnGroup')
        data = n3utils.getDataPerSeries(outerScope.data, outerScope.options)
        args = [data[1].values[0], 0, data[1], data[1].values[0].raw]

        columnGroup.children()[0].click()
        expect(clicked.calledWith.apply(clicked, args)).to.equal(true)

      it 'should dispatch a hover event when hovering over a dot', ->
        hovered = sinon.spy((d, i, series, raw) -> 'pouet')

        outerScope.$apply ->
          outerScope.options =
            series: [
              {y: 'value', color: '#4682b4'}
              {y: 'value', axis: 'y2', type: 'column', color: '#4682b4'}
            ]
            tooltip: {mode: 'axes'}
          outerScope.hovered = hovered

        dotGroup = element.childByClass('dotGroup')
        data = n3utils.getDataPerSeries(outerScope.data, outerScope.options)
        args = [data[0].values[0], 0, data[0], data[0].values[0].raw]

        fakeMouse.hoverIn(dotGroup.children()[0].domElement)
        expect(hovered.calledWith.apply(hovered, args)).to.equal(true)

      it 'should dispatch a hover event when hovering over a column', ->
        hovered = sinon.spy((d, i, series, raw) -> 'pouet')

        outerScope.$apply ->
          outerScope.options =
            series: [
              {y: 'value', color: '#4682b4'}
              {y: 'value', axis: 'y2', type: 'column', color: '#4682b4'}
            ]
            tooltip: {mode: 'axes'}
          outerScope.hovered = hovered

        columnGroup = element.childByClass('columnGroup')
        data = n3utils.getDataPerSeries(outerScope.data, outerScope.options)
        args = [data[1].values[0], 0, data[1], data[1].values[0].raw]

        fakeMouse.hoverIn(columnGroup.children()[0].domElement)
        expect(hovered.calledWith.apply(hovered, args)).to.equal(true)

      it 'should dispatch a mouseenter events when hovering over a dot', ->
        mouseenter = sinon.spy((d, i, series, raw) -> 'pouet')

        outerScope.$apply ->
          outerScope.options =
            series: [{y: 'value'}]
            tooltip: {mode: 'axes'}
          outerScope.mouseentered = mouseenter

        dotGroup = element.childByClass('dotGroup')
        data = n3utils.getDataPerSeries(outerScope.data, outerScope.options)
        args = [data[0].values[0], 0, data[0], data[0].values[0].raw]

        fakeMouse.mouseEnter(dotGroup.children()[0].domElement)
        expect(mouseenter.calledWith.apply(mouseenter, args)).to.equal(true)

      it 'should dispatch a mouseover events when hovering over a dot', ->
        mouseover = sinon.spy((d, i, series, raw) -> 'pouet')

        outerScope.$apply ->
          outerScope.options =
            series: [{y: 'value'}]
            tooltip: {mode: 'axes'}
          outerScope.mouseovered = mouseover

        dotGroup = element.childByClass('dotGroup')
        data = n3utils.getDataPerSeries(outerScope.data, outerScope.options)
        args = [data[0].values[0], 0, data[0], data[0].values[0].raw]

        fakeMouse.mouseOver(dotGroup.children()[0].domElement)
        expect(mouseover.calledWith.apply(mouseover, args)).to.equal(true)

      it 'should dispatch a mouseout events when hovering over a dot', ->
        mouseout = sinon.spy((d, i, series, raw) -> 'pouet')

        outerScope.$apply ->
          outerScope.options =
            series: [{y: 'value'}]
            tooltip: {mode: 'axes'}
          outerScope.mouseouted = mouseout

        dotGroup = element.childByClass('dotGroup')
        data = n3utils.getDataPerSeries(outerScope.data, outerScope.options)
        args = [data[0].values[0], 0, data[0], data[0].values[0].raw]

        fakeMouse.mouseOut(dotGroup.children()[0].domElement)
        expect(mouseout.calledWith.apply(mouseout, args)).to.equal(true)