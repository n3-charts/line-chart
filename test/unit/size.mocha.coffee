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
    sinon.stub(innerScope, 'update', ->)
    sinon.spy(innerScope, 'redraw')

  it 'should redraw when $window resize', inject ($window) ->
    e = document.createEvent('HTMLEvents')
    e.initEvent 'resize', true, false
    $window.dispatchEvent e

  it 'should pass the new dimensions to update when $window is resized ', inject ($window) ->
    sinon.stub innerScope, 'updateDimensions', (d) ->
      d.width = 120
      d.height = 50

    # This could be better...
    e = document.createEvent('HTMLEvents')
    e.initEvent 'resize', true, false
    $window.dispatchEvent e

  describe 'computation method', ->
    it 'should have default size', inject (pepito) ->
      {element, outerScope} = pepito.directive("""
      <div>
        <linechart data='data' options='options'></linechart>
      </div>
      """,
      (element) ->
        innerScope = element.children()[0].aElement.isolateScope()
        sinon.spy innerScope, 'update'
        sinon.spy innerScope, 'redraw'
      )

      innerScope = element.childByClass('chart').aElement.isolateScope()
      expect(innerScope.update.args[0][0]).to.eql
        top: 20
        right: 50
        bottom: 60
        left: 50
        width: 900
        height: 500

    it 'should consider forced dimensions', inject (pepito, n3utils) ->
      {element, outerScope, innerScope} = pepito.directive("""
        <div id="toto">
          <linechart width="234" height="556" data='data' options='options'></linechart>
        </div>
      """,
      (element) ->
        innerScope = element.children()[0].aElement.isolateScope()
        sinon.stub innerScope, 'update', ->
        sinon.spy innerScope, 'redraw'

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

      expect(innerScope.update.args[1][0]).to.eql
        top: 20
        right: 50
        bottom: 60
        left: 50
        width: 174
        height: 496


    it 'should detect parent\'s top padding', inject (pepito, n3utils) ->
      {element, outerScope} = pepito.directive("""
      <div id="toto">
        <linechart data='data' options='options'></linechart>
      </div>
      """,
      (element) ->
        innerScope = element.children()[0].aElement.isolateScope()
        sinon.stub innerScope, 'update', ->
        sinon.spy innerScope, 'redraw'

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
      expect(innerScope.update.args[1][0]).to.eql
        top: 20
        right: 50
        bottom: 60
        left: 50
        width: 840
        height: 440

