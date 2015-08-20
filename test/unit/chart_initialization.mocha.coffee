describe 'chart initialization', ->
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

  describe 'axes tooltip', ->

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
            y: 'value'
            color: '#4682b4'
            type: 'area'
          ]
          tooltip: {mode: 'axes'}

    it 'should create one svg element', ->
      # this is the template's div
      expect(element.domElement.nodeName).to.equal('DIV')
      chart = element.childByClass('chart')
      expect(chart).not.to.equal(undefined)

      expect(chart.child('svg')).not.to.equal(undefined)

    it 'should draw two axes by default', ->
      chart = element.childByClass('chart')
      content = chart.child('svg').children()[0].children()

      expect(content.length).to.equal(10)
      expect(content[0].getAttribute('class')).to.equal('patterns')
      expect(content[1].getAttribute('class')).to.equal('y grid')
      expect(content[2].getAttribute('class')).to.equal('y axis')
      expect(content[3].getAttribute('class')).to.equal('x grid')
      expect(content[4].getAttribute('class')).to.equal('x axis')
      expect(content[5].getAttribute('class')).to.equal('content')
      expect(content[6].getAttribute('class')).to.equal('legend')
      expect(content[7].getAttribute('id')).to.equal('xTooltip')
      expect(content[8].getAttribute('id')).to.equal('yTooltip')
      expect(content[9].getAttribute('class')).to.equal('focus-container')

    it 'should generate properly the main elements for axes tooltip', ->
      outerScope.$apply ->
        outerScope.options =
          series: [
            {
              axis: 'y'
              y: 'value'
              color: '#4682b4'
            }
            {
              axis: 'y2'
              y: 'value'
              color: '#4682b4'
            }
          ]
          tooltip: {mode: 'axes'}

      chart = element.childByClass('chart')
      content = chart.child('svg').children()[0].children()

      expect(content.length).to.equal(13)
      expect(content[0].getAttribute('class')).to.equal('patterns')
      expect(content[1].getAttribute('class')).to.equal('y grid')
      expect(content[2].getAttribute('class')).to.equal('y axis')
      expect(content[3].getAttribute('class')).to.equal('y2 grid')
      expect(content[4].getAttribute('class')).to.equal('y2 axis')
      expect(content[5].getAttribute('class')).to.equal('x grid')
      expect(content[6].getAttribute('class')).to.equal('x axis')
      expect(content[7].getAttribute('class')).to.equal('content')
      expect(content[8].getAttribute('class')).to.equal('legend')
      expect(content[9].getAttribute('id')).to.equal('xTooltip')
      expect(content[10].getAttribute('id')).to.equal('yTooltip')
      expect(content[11].getAttribute('id')).to.equal('y2Tooltip')
      expect(content[12].getAttribute('class')).to.equal('focus-container')

    it 'should create a clipping path for the content', ->
      chart = element.childByClass('chart')
      clip = chart.child('defs').children()[0]
      expect(clip.getAttribute('class')).to.equal('content-clip')
      expect(clip.domElement.tagName).to.equal('clipPath')
      expect(clip.innerHTML()).to.match(/^<rect (.)+><\/rect>$/)

    it 'should set the proper dimensions for the content clipping path', inject (n3utils, pepito) ->
      {element, innerScope, outerScope} = pepito.directive """
      <div>
        <linechart data="data" options="options" width="400" height="200"></linechart>
      </div>
      """
      clipRect = element.childByClass('content-clip').children()[0]

      m = n3utils.getDefaultMargins()
      w = 400-m.left-m.right
      h = 200-m.top-m.bottom
      
      expect(clipRect.getAttribute('x')).to.equal('0')
      expect(clipRect.getAttribute('y')).to.equal('0')
      expect(clipRect.getAttribute('width')).to.equal("#{w}")
      expect(clipRect.getAttribute('height')).to.equal("#{h}")

    it 'should set the proper dimensions for the content clipping path', inject (n3utils, pepito) ->
      outerScope.$apply ->
        outerScope.options.hideOverflow = false

      content = element.childByClass('content')
      expect(content.getAttribute('clip-path')).to.equal(null)

      outerScope.$apply ->
        outerScope.options.hideOverflow = true

      content = element.childByClass('content')
      expect(content.getAttribute('clip-path')).to.match(/^url\(#content-clip-(.)+\)$/)
