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

  it 'should call redraw when window is resized ', inject (pepito, fakeWindow, $timeout) ->
    {element, outerScope} = pepito.directive("""
      <div>
        <linechart data='data' options='options'></linechart>
      </div>
      """,
      (element) ->
        innerScope = element.children()[0].aElement.isolateScope()
      )

    spy = sinon.spy(innerScope, 'redraw')

    expect(spy.callCount).to.equal(0)

    # Trigger a resize event
    fakeWindow.resize()
    outerScope.$digest()
    $timeout.flush()

    expect(spy.callCount).to.equal(1)

  describe 'computation method', ->
    it 'should have default size', inject (pepito, n3utils) ->
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

      svgElem = element.childByClass('chart').children()[0].domElement
      expect(svgElem.width.baseVal.value).to.equal(900)
      expect(svgElem.height.baseVal.value).to.equal(500)

    it 'should consider forced dimensions', inject (pepito, n3utils) ->
      {element, outerScope} = pepito.directive("""
      <div id="toto">
        <linechart width="234" height="556" data='data' options='options'></linechart>
      </div>
      """,
      (element) ->
        innerScope = element.children()[0].aElement.isolateScope()
        sinon.spy innerScope, 'update'
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

      outerScope.$digest()

      svgElem = element.childByClass('chart').children()[0].domElement
      expect(svgElem.width.baseVal.value).to.equal(174)
      expect(svgElem.height.baseVal.value).to.equal(496)

    it 'should detect parent\'s top padding', inject (pepito, n3utils) ->
      {element, outerScope} = pepito.directive("""
      <div id="toto">
        <linechart data='data' options='options'></linechart>
      </div>
      """,
      (element) ->
        innerScope = element.children()[0].aElement.isolateScope()
        sinon.spy innerScope, 'update'
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

      outerScope.$digest()
      
      svgElem = element.childByClass('chart').children()[0].domElement
      expect(svgElem.width.baseVal.value).to.equal(840)
      expect(svgElem.height.baseVal.value).to.equal(440)

