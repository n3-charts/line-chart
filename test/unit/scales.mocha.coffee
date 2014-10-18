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
