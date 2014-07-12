describe 'chart initialization (old module name)', ->
  element = undefined
  innerScope = undefined
  outerScope = undefined

  beforeEach module 'n3-charts.linechart'
  beforeEach module 'testUtils'

  beforeEach inject (n3utils, pepito) ->
    sinon.stub n3utils, 'getDefaultMargins', ->
      top: 20
      right: 50
      bottom: 30
      left: 50

    sinon.stub n3utils, 'getTextBBox', -> {width: 30}

    {element, innerScope, outerScope} = pepito.directive """
    <div>
      <linechart data="data" options="options"></linechart>
    </div>
    """

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
    expect(element.domElement.nodeName).to.equal 'DIV'
    chart = element.childByClass('chart')
    expect(chart).not.to.equal(undefined)

    expect(chart.child('svg')).not.to.equal(undefined)

  it 'should draw two axes by default', ->
    chart = element.childByClass('chart')
    content = chart.child('svg').children()[0].children()

    expect(content.length).to.equal 7
    expect(content[0].getAttribute('class')).to.equal 'patterns'
    expect(content[1].getAttribute('class')).to.equal 'x axis'
    expect(content[2].getAttribute('class')).to.equal 'y axis'
    expect(content[5].getAttribute('id')).to.equal 'xTooltip'
    expect(content[6].getAttribute('id')).to.equal 'yTooltip'

  it 'should generate properly the main elements', ->
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

    expect(content.length).to.equal 9
    expect(content[0].getAttribute('class')).to.equal 'patterns'
    expect(content[1].getAttribute('class')).to.equal 'x axis'
    expect(content[2].getAttribute('class')).to.equal 'y axis'
    expect(content[3].getAttribute('class')).to.equal 'y2 axis'
    expect(content[4].getAttribute('class')).to.equal 'content'
    expect(content[5].getAttribute('class')).to.equal 'legend'
    expect(content[6].getAttribute('id')).to.equal 'xTooltip'
    expect(content[7].getAttribute('id')).to.equal 'yTooltip'
    expect(content[8].getAttribute('id')).to.equal 'y2Tooltip'

