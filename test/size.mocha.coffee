describe 'size', ->
  element = undefined
  innerScope = undefined
  outerScope = undefined

  beforeEach module 'n3-line-chart'
  beforeEach module 'testUtils'

  beforeEach inject (pepito) ->
    {element, outerScope} = pepito.directive """
    <div>
      <linechart data='data' options='options'></linechart>
    </div>
    """
    innerScope = element.childByClass('chart').aElement.isolateScope()
    sinon.stub(innerScope, 'redraw', ->)
    sinon.spy(innerScope, 'update')

  it 'should update when $window resize', inject ($window) ->
    e = document.createEvent('HTMLEvents')
    e.initEvent 'resize', true, false
    $window.dispatchEvent e

  it 'should pass the new dimensions to redraw when $window is resized ', inject ($window) ->
    sinon.stub innerScope, 'updateDimensions', (d) ->
      d.width = 120
      d.height = 50

    # This could be better...
    e = document.createEvent('HTMLEvents')
    e.initEvent 'resize', true, false
    $window.dispatchEvent e

  describe 'size computation method', ->
    it 'should have default size', inject (pepito) ->
      {element, outerScope} = pepito.directive("""
      <div>
        <linechart data='data' options='options'></linechart>
      </div>
      """,
      (element) ->
        innerScope = element.children()[0].aElement.isolateScope()
        sinon.spy innerScope, 'redraw'
        sinon.spy innerScope, 'update'
      )

      innerScope = element.childByClass('chart').aElement.isolateScope()
      expect(innerScope.redraw.args[0][0]).to.eql
        top: 20
        right: 50
        bottom: 60
        left: 50
        width: 900
        height: 500

    it 'should detect parent\'s top padding', inject (pepito, n3utils) ->
      {element, outerScope} = pepito.directive("""
      <div id="toto">
        <linechart data='data' options='options'></linechart>
      </div>
      """,
      (element) ->
        innerScope = element.children()[0].aElement.isolateScope()
        sinon.stub innerScope, 'redraw', ->
        sinon.spy innerScope, 'update'

        sinon.stub n3utils, 'getPixelCssProp', (element, property) ->
          throw new Error('Invalid id given to getPixelCssProp function') if element.id isnt 'toto'
          throw new Error('Invalid property given to getPixelCssProp function') if [
            'padding-top'
            'padding-bottom'
            'padding-left'
            'padding-right'
          ].indexOf(property) is -1
          return {
            'padding-top': 50
            'padding-bottom': 10
            'padding-left': 20
            'padding-right': 40
          }[property]
      )

      innerScope = element.children()[0].aElement.isolateScope()

      outerScope.$digest()
      expect(innerScope.redraw.args[1][0]).to.eql
        top: 20
        right: 50
        bottom: 60
        left: 50
        width: 840
        height: 440

