describe 'scales', ->

  n3utils = undefined
  element = undefined
  innerScope = undefined
  outerScope = undefined

  beforeEach module 'n3-line-chart'
  beforeEach module 'testUtils'

  beforeEach inject (_n3utils_) ->
    n3utils = _n3utils_
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

  describe 'unit functions', ->
    describe 'getAverageStep', ->
      it 'should return 0 if only one datum', ->
        expect(n3utils.getAverageStep([{x: 1}], 'x')).to.equal(0)

    describe 'xExtent', ->
      it 'should work even with one datum', ->
        expect(n3utils.xExtent([{x: 1}], 'x')).to.eql([0, 2])
        expect(n3utils.xExtent([{x: -1}], 'x')).to.eql([-2, 0])

    describe 'yExtent', ->
      it 'should work even with one datum', ->
        expect(n3utils.yExtent([{y: 'val'}], [{val: 0.6}], [])).to.eql([0, 1.2])
        expect(n3utils.yExtent([{y: 'val'}], [{val: -0.6}], [])).to.eql([-1.2, 0])

      it 'should work with stacks', ->
        series = [
          {y: 'val_0', id: 'id0'}
          {y: 'val_1', id: 'id1'}
        ]

        data = [
          {val_0: 1, val_1: 2}
          {val_0: 1, val_1: 20}
        ]

        expect(n3utils.yExtent(series, data, [{series: ['id0', 'id1']}])).to.eql([1, 21])

  describe 'tick count', ->
    beforeEach ->
      outerScope.$apply ->
        outerScope.data = [
          {x: 0, value: 4}
          {x: 1, value: 8}
        ]
        outerScope.options =
          axes:
            x: {ticks: 2}
            y: {ticks: 3}
          series: [
            {y: 'value', color: '#4682b4', label: 'toto'}
            {y: 'value', axis: 'y2', color: '#4682b4', type: 'column'}
          ]

    it 'should work for vertical axes', ->
      yticks = element.childByClass('y axis').children('text')
      computedYTicks = yticks.map (t) -> t.domElement.textContent

      expect(computedYTicks).to.eql(['4', '6', '8'])

    it 'should work for horizontal axis', ->
      xticks = element.childByClass('x axis').children('text')
      computedXTicks = xticks.map (t) -> t.domElement.textContent
      expect(computedXTicks).to.eql(['0', '2'])

  describe 'inner ticks', ->
    beforeEach ->
      outerScope.$apply ->
        outerScope.data = [
          {x: 0, value: 4}
          {x: 1, value: 8}
        ]
        outerScope.options =
          axes:
            x: {}
            y: {}
            y2: {}
          series: [
            {y: 'value'}
            {y: 'value', axis: 'y'}
            {y: 'value', axis: 'y2'}
          ]

    it 'should render the ticks visible', ->
      xticks = element.childByClass('x axis').children('line')
      yticks = element.childByClass('x axis').children('line')
      y2ticks = element.childByClass('x axis').children('line')

      expect(xticks[0].getAttribute('stroke')).to.equal(null)
      expect(yticks[0].getAttribute('stroke')).to.equal(null)
      expect(y2ticks[0].getAttribute('stroke')).to.equal(null)

      outerScope.$apply ->
        outerScope.options.axes.x.innerTicks = true
        outerScope.options.axes.y.innerTicks = true
        outerScope.options.axes.y2.innerTicks = true

      xticks = element.childByClass('x axis').children('line')
      yticks = element.childByClass('x axis').children('line')
      y2ticks = element.childByClass('x axis').children('line')

      expect(xticks[0].getAttribute('stroke')).to.equal('#000')
      expect(yticks[0].getAttribute('stroke')).to.equal('#000')
      expect(y2ticks[0].getAttribute('stroke')).to.equal('#000')

  describe 'grid', ->
    beforeEach ->
      outerScope.$apply ->
        outerScope.data = [
          {x: 0, value: 4}
          {x: 1, value: 8}
        ]
        outerScope.options =
          axes:
            x: {}
            y: {}
            y2: {}
          series: [
            {y: 'value'}
            {y: 'value', axis: 'y'}
            {y: 'value', axis: 'y2'}
          ]

    it 'should render the grid visible', ->
      xgrid = element.childByClass('x grid').children('line')
      ygrid = element.childByClass('x grid').children('line')
      y2grid = element.childByClass('x grid').children('line')

      expect(xgrid[0]).to.equal(undefined)
      expect(ygrid[0]).to.equal(undefined)
      expect(y2grid[0]).to.equal(undefined)

      outerScope.$apply ->
        outerScope.options.axes.x.grid = true
        outerScope.options.axes.y.grid = true
        outerScope.options.axes.y2.grid = true

      xgrid = element.childByClass('x grid').children('line')
      ygrid = element.childByClass('x grid').children('line')
      y2grid = element.childByClass('x grid').children('line')

      expect(xgrid[0].getAttribute('stroke')).to.equal('#eee')
      expect(ygrid[0].getAttribute('stroke')).to.equal('#eee')
      expect(y2grid[0].getAttribute('stroke')).to.equal('#eee')

  describe 'tick values', ->
    beforeEach ->
      outerScope.$apply ->
        outerScope.data = [
          {x: 0, value: 4}
          {x: 1, value: 8}
        ]
        outerScope.options =
          axes:
            x: {ticks: [-1, 0, 1]}
            y: {ticks: [1, 2, 3]}
          series: [
            {y: 'value', color: '#4682b4', label: 'toto'}
            {y: 'value', axis: 'y2', color: '#4682b4', type: 'column'}
          ]

    it 'should work for horizontal axis', ->
      xticks = element.childByClass('x axis').children('text')
      computedXTicks = xticks.map (t) -> t.domElement.textContent

      expect(computedXTicks).to.eql(['-1.0', '0.0', '1.0'])

    it 'should work for vertical axes', ->
      yticks = element.childByClass('y axis').children('text')
      computedYTicks = yticks.map (t) -> t.domElement.textContent

      expect(computedYTicks).to.eql(['1.0', '2.0', '3.0'])

    it 'should add rotation if ticksRotate is defined', ->

      xticks = element.childByClass('x axis').children('text')
      yticks = element.childByClass('y axis').children('text')
      y2ticks = element.childByClass('y2 axis').children('text')

      expect(xticks[xticks.length - 1].getAttribute('transform')).to.equal(null)
      expect(yticks[yticks.length - 1].getAttribute('transform')).to.equal(null)
      expect(y2ticks[y2ticks.length - 1].getAttribute('transform')).to.equal(null)
      
      outerScope.$apply ->
        outerScope.options.axes.x.ticksRotate = 45
        outerScope.options.axes.y.ticksRotate = -45
        outerScope.options.axes.y2.ticksRotate = 15.5

      xticks = element.childByClass('x axis').children('text')
      yticks = element.childByClass('y axis').children('text')
      y2ticks = element.childByClass('y2 axis').children('text')

      expect(xticks[xticks.length - 1].getAttribute('transform')).to.match(/rotate\(45( [\-0-9]+,[\-0-9]+){0,1}\)$/)
      expect(yticks[yticks.length - 1].getAttribute('transform')).to.match(/rotate\(-45( [\-0-9]+,[\-0-9]+){0,1}\)$/)
      expect(y2ticks[y2ticks.length - 1].getAttribute('transform')).to.match(/rotate\(15.5( [\-0-9]+,[\-0-9]+){0,1}\)$/)

    it 'should rotate ticks label around the ticks center if ticksRotate is defined', ->
      
      outerScope.$apply ->
        outerScope.options.axes.x.ticksRotate = 45
        outerScope.options.axes.y.ticksRotate = -45
        outerScope.options.axes.y2.ticksRotate = 15.5

      xticks = element.childByClass('x axis').children('text')
      yticks = element.childByClass('y axis').children('text')
      y2ticks = element.childByClass('y2 axis').children('text')

      expect(xticks[xticks.length - 1].getAttribute('transform')).to.match(/rotate\([\-0-9.]+ 0,6\)$/)
      expect(yticks[yticks.length - 1].getAttribute('transform')).to.match(/rotate\([\-0-9.]+ -6,0\)$/)
      expect(y2ticks[y2ticks.length - 1].getAttribute('transform')).to.match(/rotate\([\-0-9.]+ 6,0\)$/)

    it 'should align ticks if ticksRotate is defined', ->

      xticks = element.childByClass('x axis').children('text')
      yticks = element.childByClass('y axis').children('text')
      y2ticks = element.childByClass('y2 axis').children('text')

      expect(xticks[xticks.length - 1].getAttribute('dy')).to.equal('.71em')
      expect(yticks[yticks.length - 1].getAttribute('dy')).to.equal('.32em')
      expect(y2ticks[y2ticks.length - 1].getAttribute('dy')).to.equal('.32em')

      outerScope.$apply ->
        outerScope.options.axes.x.ticksRotate = 45
        outerScope.options.axes.y.ticksRotate = -45
        outerScope.options.axes.y2.ticksRotate = 15.5

      xticks = element.childByClass('x axis').children('text')
      yticks = element.childByClass('y axis').children('text')
      y2ticks = element.childByClass('y2 axis').children('text')

      expect(xticks[xticks.length - 1].getAttribute('dy')).to.equal(null)
      expect(yticks[yticks.length - 1].getAttribute('dy')).to.equal('.32em')
      expect(y2ticks[y2ticks.length - 1].getAttribute('dy')).to.equal('.32em')
      expect(xticks[xticks.length - 1].getAttribute('transform')).to.match(/^translate\(0,5\)( ){0,1}rotate(.*)/)
      expect(yticks[yticks.length - 1].getAttribute('transform')).to.match(/^rotate(.*)$/)
      expect(y2ticks[y2ticks.length - 1].getAttribute('transform')).to.match(/^rotate(.*)$/)

    it 'should set text-anchor for x-axis properly if ticksRotate is defined', ->

      outerScope.$apply ->
        outerScope.options.axes.x.ticksRotate = undefined

      xticks = element.childByClass('x axis').children('text')
      expect(xticks[xticks.length - 1].getStyle('text-anchor')).to.equal('middle')

      outerScope.$apply ->
        outerScope.options.axes.x.ticksRotate = 0

      xticks = element.childByClass('x axis').children('text')
      expect(xticks[xticks.length - 1].getStyle('text-anchor')).to.equal('start')

      outerScope.$apply ->
        outerScope.options.axes.x.ticksRotate = 45

      xticks = element.childByClass('x axis').children('text')
      expect(xticks[xticks.length - 1].getStyle('text-anchor')).to.equal('start')

      outerScope.$apply ->
        outerScope.options.axes.x.ticksRotate = -45

      xticks = element.childByClass('x axis').children('text')
      expect(xticks[xticks.length - 1].getStyle('text-anchor')).to.equal('end')

    it 'should set text-anchor for y-axis properly if ticksRotate is defined', ->

      outerScope.$apply ->
        outerScope.options.axes.y.ticksRotate = undefined

      yticks = element.childByClass('y axis').children('text')
      expect(yticks[yticks.length - 1].getStyle('text-anchor')).to.equal('end')

      outerScope.$apply ->
        outerScope.options.axes.y.ticksRotate = 0

      yticks = element.childByClass('y axis').children('text')
      expect(yticks[yticks.length - 1].getStyle('text-anchor')).to.equal('end')

      outerScope.$apply ->
        outerScope.options.axes.y.ticksRotate = 45

      yticks = element.childByClass('y axis').children('text')
      expect(yticks[yticks.length - 1].getStyle('text-anchor')).to.equal('end')

      outerScope.$apply ->
        outerScope.options.axes.y.ticksRotate = -45

      yticks = element.childByClass('y axis').children('text')
      expect(yticks[yticks.length - 1].getStyle('text-anchor')).to.equal('end')

    it 'should set text-anchor for y2-axis properly if ticksRotate is defined', ->

      outerScope.$apply ->
        outerScope.options.axes.y2.ticksRotate = undefined

      y2ticks = element.childByClass('y2 axis').children('text')
      expect(y2ticks[y2ticks.length - 1].getStyle('text-anchor')).to.equal('start')

      outerScope.$apply ->
        outerScope.options.axes.y2.ticksRotate = 0

      y2ticks = element.childByClass('y2 axis').children('text')
      expect(y2ticks[y2ticks.length - 1].getStyle('text-anchor')).to.equal('start')

      outerScope.$apply ->
        outerScope.options.axes.y2.ticksRotate = 45

      y2ticks = element.childByClass('y2 axis').children('text')
      expect(y2ticks[y2ticks.length - 1].getStyle('text-anchor')).to.equal('start')

      outerScope.$apply ->
        outerScope.options.axes.y2.ticksRotate = -45

      y2ticks = element.childByClass('y2 axis').children('text')
      expect(y2ticks[y2ticks.length - 1].getStyle('text-anchor')).to.equal('start')

  describe 'min and max', ->
    beforeEach ->
      outerScope.$apply ->
        outerScope.data = [
          {x: 0, value: 4}
          {x: 1, value: 8}
        ]
        outerScope.options =
          axes:
            x: {min: -5, max: 6}
            y: {min: 5, max: 6}
          series: [
            {y: 'value', color: '#4682b4', label: 'toto'}
            {y: 'value', axis: 'y2', color: '#4682b4', type: 'column'}
          ]

    it 'should work for horizontal axis', ->
      xticks = element.childByClass('x axis').children('text')
      computedXTicks = xticks.map (t) -> t.domElement.textContent

      # for some reason this is not sorted...
      expect(computedXTicks).to.eql(
        ["-5", "-4", "-3", "-2", "-1", "0", "1", "2", "3", "4", "5", "6"]
      )

    it 'should work for vertical axes', ->
      yticks = element.childByClass('y axis').children('text')
      computedYTicks = yticks.map (t) -> t.domElement.textContent
      expect(computedYTicks).to.eql(
        ['5.0', '5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8', '5.9', '6.0']
      )

  describe 'logarithmic y axes', ->
    beforeEach ->
      outerScope.$apply ->
        outerScope.data = [
          {x: 0, value: 4}
          {x: 1, value: 8}
        ]
        outerScope.options =
          axes:
            y: {type: 'log'}
          series: [
            {y: 'value', color: '#4682b4', label: 'toto'}
            {y: 'value', axis: 'y2', color: '#4682b4', type: 'column'}
          ]


    it 'should prevent log(0) from happening', ->
      outerScope.$apply ->
        outerScope.data = [
          {x: 0, value: 0}
          {x: 1, value: 80000}
          {x: 2, value: 100000}
          {x: 3, value: 30000}
        ]
        outerScope.options =
          axes:
            y: {type: 'log'}

            y2: {type: 'log'}

          series: [
            {y: 'value', color: '#4682b4', label: 'toto'}
            {y: 'value', axis: 'y2', color: '#4682b4', type: 'column'}
          ]

      expectedTicks = "1e-3         1e-2         1e-1         1e+0         1e+1         1e+2         1e+3         1e+4         1e+5"

      yticks = element.childByClass('y axis').children('text')
      computedYTicks = yticks.map (t) -> t.domElement.textContent

      y2ticks = element.childByClass('y2 axis').children('text')
      computedY2Ticks = y2ticks.map (t) -> t.domElement.textContent

      expect(computedYTicks.join(' ')).to.eql expectedTicks
      expect(computedY2Ticks.join(' ')).to.eql expectedTicks

    it 'should configure y axis with logarithmic values', ->
      expectedTicks =
        ['1e+0', '2e+0', '3e+0', '4e+0', '5e+0', '6e+0', '7e+0', '8e+0', '9e+0', '1e+1']
      yticks = element.childByClass('y axis').children('text')
      computedYTicks = yticks.map (t) -> t.domElement.textContent
      expect(computedYTicks).to.eql expectedTicks

    it 'should configure y2 axis with logarithmic values', ->
      outerScope.$apply ->
        outerScope.options =
          axes:
            y2: {type: 'log'}

          series: [
            {y: 'value', color: '#4682b4', label: 'toto'}
            {y: 'value', axis: 'y2', color: '#4682b4', type: 'column'}
          ]

      expectedTicks =
        ['1e+0', '2e+0', '3e+0', '4e+0', '5e+0', '6e+0', '7e+0', '8e+0', '9e+0', '1e+1']

      y2ticks = element.childByClass('y2 axis').children('text')
      computedY2Ticks = y2ticks.map (t) -> t.domElement.textContent
      expect(computedY2Ticks).to.eql expectedTicks

    it 'should let y2 axis in linear mode if told so', ->
      expectedTicks =
        ['4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0']

      y2ticks = element.childByClass('y2 axis').children('text')
      computedY2Ticks = y2ticks.map (t) -> t.domElement.textContent
      expect(computedY2Ticks).to.eql expectedTicks

    it 'should compute the correct interval for time range function with ticksInterval', ->
      outerScope.$apply ->
        outerScope.data = [
          {x: new Date(2015, 0, 4), value: 1}
          {x: new Date(2015, 0, 5), value: 1}
          {x: new Date(2015, 0, 6), value: 1}
          {x: new Date(2015, 0, 7), value: 1}
          {x: new Date(2015, 0, 8), value: 1}
          {x: new Date(2015, 0, 9), value: 1}
          {x: new Date(2015, 0, 10), value: 1}
        ]
        outerScope.options =
          axes:
            x: {type: 'date', ticks: d3.time.day, ticksInterval: 3, ticksFormat: '%d.%m.%Y'}

          series: [
            {y: 'value'}
          ]

      expectedTicks = ['04.01.2015', '07.01.2015', '10.01.2015']
      xticks = element.childByClass('x axis').children('text')
      computedXTicks = xticks.map (t) -> t.domElement.textContent
      expect(computedXTicks).to.eql(expectedTicks)
