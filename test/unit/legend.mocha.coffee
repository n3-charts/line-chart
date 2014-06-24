describe 'legend', ->
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
    innerScope = element.childByClass('chart').aElement.isolateScope()

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

  it 'should update the outer options when a series is hidden or shown', ->
    spy = sinon.spy()
    outerScope.$watch('options', spy, true)

    element.childrenByClass('legendItem')[0].click()
    expect(outerScope.options.series[0].visible).to.equal(false)
    expect(spy.callCount).to.equal(1)

    element.childrenByClass('legendItem')[0].click()
    expect(outerScope.options.series[0].visible).to.equal(true)
    expect(spy.callCount).to.equal(2)

  it 'should create a clipping path for legend items', ->
    patterns = element.childByClass('patterns')
    expect(patterns.children().length).to.equal 1
    pattern = patterns.children()[0]
    expect(pattern.getAttribute('id')).to.equal 'legend-clip'
    expect(pattern.domElement.tagName).to.equal 'clipPath'
    expect(pattern.innerHTML()).to.equal '<circle r="8"></circle>'

  it 'should create legend elements', inject (fakeMouse) ->
    legendGroup = element.childByClass('legend')
    expect(legendGroup.children().length).to.equal 2
    l_0 = legendGroup.children()[0].domElement
    expect(l_0.getAttribute('class')).to.equal 'legendItem series_0'
    expect(l_0.childNodes[0].nodeName).to.equal 'circle'
    expect(l_0.childNodes[0].getAttribute('fill')).to.equal '#4682b4'
    expect(l_0.childNodes[1].getAttribute('clip-path')).to.equal 'url(#legend-clip)'

    fakeMouse.clickOn(l_0.childNodes[0])

    fn = (cl) -> element.childByClass(cl).getStyle('display')

    expect(fn('lineGroup series_0')).to.equal('none')
    expect(fn('dotGroup series_0')).to.equal('none')
    expect(element.childrenByClass('legendItem')[0].getAttribute('opacity')).to.equal('0.2')

    fakeMouse.clickOn(l_0.childNodes[0])
    expect(fn('lineGroup series_0')).to.equal('initial')
    expect(fn('dotGroup series_0')).to.equal('initial')
    expect(element.childrenByClass('legendItem')[0].getAttribute('opacity')).to.equal('1')

  it 'should be able to hide a series at startup', ->
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
          visible: false
        }
        {
          y: 'value'
          axis: 'y2'
          color: '#4682b4'
          type: 'column'
        }
      ]

    fn = (cl) -> element.childByClass(cl).getStyle('display')
    expect(fn('lineGroup series_0')).to.equal('none')
    expect(fn('dotGroup series_0')).to.equal('none')
    expect(element.childrenByClass('legendItem')[0].getAttribute('opacity')).to.equal('0.2')


  describe.skip 'layout computation', ->
    n3utils = null
    dim = {top: 20, right: 40, bottom: 30, left: 40, width: 900, height: 500}

    beforeEach inject (_n3utils_) ->
      n3utils = _n3utils_

    it 'should compute for left series', ->
      series = [
        {label: 'pouet', axis: 'y'}
        {label: 'tut', axis: 'y'}
      ]

      expect(n3utils.computeLegendLayout(series, dim)).to.eql([0, 75])

    it 'should compute for right series too', ->
      series = [
        {label: 'pouet', axis: 'y'}
        {label: 'tut', axis: 'y2'}
        {label: 'bwabwabwa', axis: 'y2'}
      ]

      expect(n3utils.computeLegendLayout(series, dim)).to.eql([0, 700, 765])
