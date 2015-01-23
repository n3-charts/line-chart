describe "abscissas", ->
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
      <linechart data="data" options="options"></linechart>
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

        outerScope.options =
          axes:
            x:
              labelFunction: (v) -> '#' + v * .1
          series: [
            y: 'value'
            color: '#4682b4'
          ]

    it 'should configure x axis', ->
      ticks = element.childByClass('x axis').children('text')

      expect(ticks.length).to.equal 11
      expect(ticks[0].domElement.textContent).to.equal '#0'
      expect(ticks[10].domElement.textContent).to.equal '#0.5'

    it 'should draw a line', ->
      linePath = element.childByClass('line')

      expect(linePath.hasClass('line')).to.equal true
      expect(linePath.domElement.getAttribute('d')).to.equal 'M0,410L160,370L320,300L480,290L640,220L800,30'


  describe 'default key', ->
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
        ]

    it 'should configure x axis', ->
      ticks = element.childByClass('x axis').children('text')

      expect(ticks.length).to.equal 11
      expect(ticks[0].domElement.textContent).to.equal '0.0'
      expect(ticks[10].domElement.textContent).to.equal '5.0'

    it 'should draw a line', ->
      linePath = element.childByClass('line')

      expect(linePath.hasClass('line')).to.equal true
      expect(linePath.domElement.getAttribute('d')).to.equal 'M0,410L160,370L320,300L480,290L640,220L800,30'


  describe 'min, max', ->
    beforeEach ->
      outerScope.$apply ->
        outerScope.data = [
          {foo: 0, value: 4}
          {foo: 1, value: 8}
          {foo: 2, value: 15}
          {foo: 3, value: 16}
          {foo: 4, value: 23}
          {foo: 5, value: 42}
        ]
        outerScope.options =
          axes:
            x:
              key: 'foo'
              min: 10
              max: 50

          series: [
            y: 'value'
            color: '#4682b4'
          ]

    it 'should properly configure x axis', ->
      ticks = element.childByClass('x axis').children('text')

      expect(ticks.length).to.equal 9
      expect(ticks[0].domElement.textContent).to.equal '10'
      expect(ticks[8].domElement.textContent).to.equal '50'

    it 'should draw a line', ->
      linePath = element.childByClass('line')

      expect(linePath.hasClass('line')).to.equal true
      expect(linePath.domElement.getAttribute('d')).to.equal 'M-200,410L-180,370L-160,300L-140,290L-120,220L-100,30'

  describe 'custom key', ->
    beforeEach ->
      outerScope.$apply ->
        outerScope.data = [
          {foo: 0, value: 4}
          {foo: 1, value: 8}
          {foo: 2, value: 15}
          {foo: 3, value: 16}
          {foo: 4, value: 23}
          {foo: 5, value: 42}
        ]
        outerScope.options =
          axes:
            x:
              key: 'foo'

          series: [
            y: 'value'
            color: '#4682b4'
          ]

    it 'should properly configure x axis from custom key', ->
      ticks = element.childByClass('x axis').children('text')

      expect(ticks.length).to.equal 11
      expect(ticks[0].domElement.textContent).to.equal '0.0'
      expect(ticks[10].domElement.textContent).to.equal '5.0'

    it 'should draw a line', ->
      linePath = element.childByClass('line')

      expect(linePath.hasClass('line')).to.equal true
      expect(linePath.domElement.getAttribute('d')).to.equal 'M0,410L160,370L320,300L480,290L640,220L800,30'
