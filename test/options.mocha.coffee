describe "options", ->
  n3utils = undefined

  beforeEach module 'n3-charts.linechart'

  beforeEach inject (_n3utils_) ->
    n3utils = _n3utils_

  describe "linemode", ->
    it "should add the default tension", ->
      o = n3utils.sanitizeOptions()
      expect(o.tension).to.equal 0.7

    it "should preserve the given tension", ->
      o = n3utils.sanitizeOptions(tension: 0.95)
      expect(o.tension).to.equal 0.95


  describe "axes", ->
    it "should return default options when given null or undefined", ->
      expect(n3utils.sanitizeOptions()).to.eql
        tooltipMode: "default"
        lineMode: "linear"
        tension: 0.7
        axes:
          x:
            type: "linear"
            key: "x"

          y:
            type: "linear"

        series: []


    it "should set default axes and empty series", ->
      o = n3utils.sanitizeOptions({})
      expect(o.axes).to.eql
        x:
          type: "linear"
          key: "x"

        y:
          type: "linear"

      expect(o.series).to.eql []

    it "should set default x axis type to linear", ->
      o = n3utils.sanitizeOptions(axes:
        x: {}
        y: {}
      )
      expect(o.axes.x.type).to.equal "linear"
      expect(o.axes.y.type).to.equal "linear"

    it "should set default y axis", ->
      o = n3utils.sanitizeOptions(axes:
        x: {}
      )
      expect(o.axes.y).to.eql type: "linear"

    it "should set default x axis", ->
      expect(n3utils.sanitizeOptions(
        tooltipMode: "default"
        lineMode: "linear"
        axes: {}
      )).to.eql
        tooltipMode: "default"
        lineMode: "linear"
        tension: 0.7
        axes:
          x:
            type: "linear"
            key: "x"

          y:
            type: "linear"

        series: []


    it "should allow x axis key configuration", ->
      expect(n3utils.sanitizeOptions(
        tooltipMode: "default"
        lineMode: "linear"
        axes:
          x:
            key: "foo"
      )).to.eql
        tooltipMode: "default"
        lineMode: "linear"
        tension: 0.7
        axes:
          x:
            type: "linear"
            key: "foo"

          y:
            type: "linear"

        series: []



  describe "series", ->
    it "should set line or area's line thickness", ->
      f = n3utils.sanitizeSeriesOptions
      
      expect(f([
        {}
        {type: "area", thickness: "2px"}
        {type: "area", color: "red", thickness: "dans ton ***"}
        {type: "column"}
      ])).to.eql [
        {type: "line", color: "#1f77b4", thickness: "1px"}
        {type: "area", color: "#ff7f0e", thickness: "2px"}
        {type: "area", color: "red", thickness: "1px"}
        {type: "column", color: "#2ca02c"}
      ]

    it "should set series colors if none found", ->
      expect(n3utils.sanitizeOptions(series: [
        {y: "value", color: "steelblue", type: "area", label: "Pouet"}
        {y: "otherValue", axis: "y2"}
      ])).to.eql
        tooltipMode: "default"
        lineMode: "linear"
        tension: 0.7
        axes:
          x:
            type: "linear"
            key: "x"

          y:
            type: "linear"

          y2:
            type: "linear"

        series: [
          {
            y: "value"
            color: "steelblue"
            type: "area"
            label: "Pouet"
            thickness: "1px"
          }
          {
            y: "otherValue"
            axis: "y2"
            color: "#1f77b4"
            type: "line"
            thickness: "1px"
          }
        ]
