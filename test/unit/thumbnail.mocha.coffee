describe 'thumbnail mode', ->
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
      <linechart data='data' options='options' mode='thumbnail'></linechart>
    </div>
    """

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
        ]

  it 'should create one svg element', ->
    # this is the template's div
    expect(element.domElement.nodeName).to.equal 'DIV'
    chart = element.childByClass('chart')
    expect(chart).not.to.equal(undefined)

    expect(chart.child('svg')).not.to.equal(undefined)

  it 'should create only content', ->
    outerScope.$apply ->
      outerScope.options = series: [
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

    svgGroup = element.child('svg').children()[0]
    expect(svgGroup.children().length).to.equal 2
    expect(svgGroup.childByClass('patterns')).not.to.equal(undefined)
    expect(svgGroup.childByClass('content')).not.to.equal(undefined)

  describe 'line series', ->
    it 'should create a group', ->
      lineGroup = element.childByClass('lineGroup series_0')
      expect(lineGroup.getAttribute('style').trim()).to.equal 'stroke: rgb(70, 130, 180);'

    it 'should only draw a line', ->
      linePath = element.childByClass('line')
      expect(linePath.getAttribute('d')).equal 'M0,453L180,409L360,331L539,320L719,243L899,33'

  describe 'area series', ->
    beforeEach ->
      outerScope.$apply ->
        outerScope.options = series: [
          axis: 'y'
          y: 'value'
          type: 'area'
          color: 'blue'
        ]

    it 'should create a group and draw an area', ->
      areaGroup = element.childByClass('areaGroup series_0')
      expect(areaGroup.getAttribute('style')).to.equal null
      areaPath = areaGroup.childByClass('area')
      expect(areaPath.getAttribute('style').trim()).to.equal 'fill: blue; opacity: 0.3;'
      expect(areaPath.getAttribute('d')).to.equal 'M0,453L180,409L360,331L539,320L719,243L899,33L899,497L719,497L539,497L360,497L180,497L0,497Z'

    it 'should draw a line', ->
      linePath = element.childByClass('line')
      expect(linePath.getAttribute('d')).to.equal 'M0,453L180,409L360,331L539,320L719,243L899,33'
