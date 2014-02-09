describe('options', function() {

  var n3utils;

  beforeEach(inject(function(_n3utils_) {
    n3utils = _n3utils_;
  }));

  describe('axes', function() {
    it('should return default options when given null or undefined', function() {
      expect(n3utils.sanitizeOptions()).toEqual(
        {tooltipMode: 'default', lineMode: 'linear', axes: {x: {type: 'linear', key: 'x'}, y: {type: 'linear'}}, series: []}
      );
    });

    it('should set default axes and empty series', function() {
      expect(n3utils.sanitizeOptions({})).toEqual(
        {tooltipMode: 'default', lineMode: 'linear', axes: {x: {type: 'linear', key: 'x'}, y: {type: 'linear'}}, series: []}
      );
    });

    it('should set default x axis type to linear', function() {
      expect(n3utils.sanitizeOptions(
        {tooltipMode: 'on-dot', lineMode: 'linear', axes: {x: {}, y: {}}})).toEqual(
          {tooltipMode: 'on-dot', lineMode: 'linear', axes: {x: {type: 'linear', key: 'x'}, y: {type: 'linear'}}, series: []}
        );
    });

    it('should set default y axis', function() {
      expect(n3utils.sanitizeOptions(
        {tooltipMode: 'default', lineMode: 'linear', axes: {x: {}}})).toEqual(
          {tooltipMode: 'default', lineMode: 'linear', axes: {x: {type: 'linear', key: 'x'}, y: {type: 'linear'}}, series: []}
        );
    });

    it('should set default x axis', function() {
      expect(n3utils.sanitizeOptions(
        {tooltipMode: 'default', lineMode: 'linear', axes: {}})).toEqual(
          {tooltipMode: 'default', lineMode: 'linear', axes: {x: {type: 'linear', key: 'x'}, y: {type: 'linear'}}, series: []}
        );
    });

    it('should allow x axis key configuration', function() {
      expect(n3utils.sanitizeOptions(
        {tooltipMode: 'default', lineMode: 'linear', axes: {x: {key: 'foo'}}})).toEqual(
          {tooltipMode: 'default', lineMode: 'linear', axes: {x: {type: 'linear', key: 'foo'}, y: {type: 'linear'}}, series: []}
        );
    });
  });

  describe('series', function() {
    it('should set line or area\'s line thickness', function() {
      var f = n3utils.sanitizeSeriesOptions;

      expect(f([
        {},
        {type: "area", thickness: "2px"},
        {type: "area", color: 'red', thickness: "dans ton ***"},
        {type: "column"}
      ])).toEqual([
        {type: "line", color: '#1f77b4', thickness: "1px"},
        {type: 'area', color: '#ff7f0e', thickness: "2px"},
        {type: 'area', color: 'red', thickness: "1px"},
        {type: 'column', color: '#2ca02c'}
      ]);


    });

    it('should set series colors if none found', function() {
      expect(n3utils.sanitizeOptions(
        {series: [
          {y: 'value', color: 'steelblue', type: 'area', label: 'Pouet'},
          {y: 'otherValue', axis: 'y2'}
        ]}
      )).toEqual(
        {tooltipMode: 'default', lineMode: 'linear', axes: {x: {type: 'linear', key: 'x'}, y: {type: 'linear'}, y2: {type: 'linear'}}, series: [
          {y: 'value', color: 'steelblue', type: 'area', label: 'Pouet', thickness: '1px'},
          {y: 'otherValue', axis: 'y2', color: '#1f77b4', type: 'line', thickness: '1px'}
        ]}
      );
    });
  });
});
