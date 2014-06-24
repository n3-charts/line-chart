describe "time series", ->
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

  beforeEach ->
    then_ = 1369145776795
    outerScope.$apply ->
      outerScope.data = [
        {
          x: new Date(then_ + 0 * 3600)
          value: 4
          foo: -2
        }
        {
          x: new Date(then_ + 1 * 3600)
          value: 8
          foo: 22
        }
        {
          x: new Date(then_ + 2 * 3600)
          value: 15
          foo: -1
        }
        {
          x: new Date(then_ + 3 * 3600)
          value: 16
          foo: 0
        }
        {
          x: new Date(then_ + 4 * 3600)
          value: 23
          foo: -3
        }
        {
          x: new Date(then_ + 5 * 3600)
          value: 42
          foo: -4
        }
      ]
      outerScope.options =
        axes:
          x:
            type: "date"

        series: [
          {
            axis: "y"
            y: "value"
            color: "#4682b4"
            type: "column"
          }
          {
            axis: "y2"
            y: "foo"
            color: "steelblue"
            type: "area"
          }
        ]


  it "should properly configure x axis", ->
    ticks = element.childByClass('x axis').children('text')
    expect(ticks.length).to.equal 5
    expect(ticks[0].domElement.textContent).to.equal ":15"
    expect(ticks[4].domElement.textContent).to.equal ":35"
