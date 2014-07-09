describe 'ordinates', ->
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

  describe 'custom ticklabel formatter', ->
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

        f = (value) -> '#' + value * .1
        f2 = (value) -> '$' + value

        outerScope.options =
          axes:
            y: {labelFunction: f}
            y2: {labelFunction: f2}

          series: [
            {y: 'value', color: '#4682b4'}
            {y: 'x', color: '#4682b4', axis: 'y2'}
          ]

    it 'should configure y axis', ->
      ticks = element.childByClass('y axis').children('text')
      expect(ticks.length).to.equal 10
      expect(ticks[0].domElement.textContent).to.equal '#0'
      expect(ticks[9].domElement.textContent).to.equal '#4.5'

    it 'should configure y2 axis', ->
      ticks = element.childByClass('y2 axis').children('text')
      expect(ticks.length).to.equal 11
      expect(ticks[0].domElement.textContent).to.equal '$0'
      expect(ticks[10].domElement.textContent).to.equal '$5'
