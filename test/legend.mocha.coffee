describe 'legend', ->
  element = undefined
  innerScope = undefined
  outerScope = undefined

  beforeEach module 'n3-charts.linechart'
  beforeEach module 'testUtils'

  beforeEach inject (n3utils) ->
    sinon.stub n3utils, 'getDefaultMargins', ->
      top: 20
      right: 50
      bottom: 30
      left: 50

  beforeEach inject (pepito) ->
    {element, innerScope, outerScope} = pepito.directive """
    <div>
      <linechart data='data' options='options'></linechart>
    </div>
    """

  beforeEach ->
    outerScope.$apply ->
      outerScope.data = [
        {x: 0, value: 4}
        {x: 1, value: 8}
      ]
      outerScope.options = series: [
        {
          y: 'value'
          color: '#4682b4'
          label: 'toto'
        }
        {
          y: 'value'
          axis: 'y2'
          color: '#4682b4'
          type: 'column'
        }
      ]

  it 'should create a clipping path for legend items', ->
    patterns = element.childByClass('patterns')
    expect(patterns.children().length).to.equal 1
    pattern = patterns.children()[0]
    expect(pattern.getAttribute('id')).to.equal 'legend-clip'
    expect(pattern.domElement.tagName).to.equal 'clipPath'
    expect(pattern.innerHTML()).to.equal '<circle r="8"></circle>'

  it 'should create legend elements', ->
    legendGroup = element.childByClass('legend')
    expect(legendGroup.children().length).to.equal 2
    l_0 = legendGroup.children()[0].domElement
    expect(l_0.getAttribute('class')).to.equal 'legendItem'
    expect(l_0.childNodes[0].nodeName).to.equal 'circle'
    expect(l_0.childNodes[0].getAttribute('fill')).to.equal '#4682b4'
    expect(l_0.childNodes[1].getAttribute('clip-path')).to.equal 'url(#legend-clip)'
    e = document.createEvent('MouseEvents')
    e.initMouseEvent 'click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null
    l_0.childNodes[0].dispatchEvent e
    l_0.childNodes[0].dispatchEvent e
