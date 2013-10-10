describe('options', function() {
  
  describe('axes', function() {
    it('should return default options when given null or undefined', inject(function(n3utils) {
      expect(n3utils.sanitizeOptions()).toEqual(
        {tooltipMode: 'default', lineMode: 'linear', axes: {x: {type: 'linear', key: 'x'}, y: {type: 'linear'}}, series: []}
      );
    }));

    it('should set default axes and empty series', inject(function(n3utils) {
      expect(n3utils.sanitizeOptions({})).toEqual(
        {tooltipMode: 'default', lineMode: 'linear', axes: {x: {type: 'linear', key: 'x'}, y: {type: 'linear'}}, series: []}
      );
    }));

    it('should set default x axis type to linear', inject(function(n3utils) {
      expect(n3utils.sanitizeOptions(
        {tooltipMode: 'on-dot', lineMode: 'linear', axes: {x: {}, y: {}}})).toEqual(
          {tooltipMode: 'on-dot', lineMode: 'linear', axes: {x: {type: 'linear', key: 'x'}, y: {type: 'linear'}}, series: []}
        );
    }));

    it('should set default y axis', inject(function(n3utils) {
      expect(n3utils.sanitizeOptions(
        {tooltipMode: 'default', lineMode: 'linear', axes: {x: {}}})).toEqual(
          {tooltipMode: 'default', lineMode: 'linear', axes: {x: {type: 'linear', key: 'x'}, y: {type: 'linear'}}, series: []}
        );
    }));

    it('should set default x axis', inject(function(n3utils) {
      expect(n3utils.sanitizeOptions(
        {tooltipMode: 'default', lineMode: 'linear', axes: {}})).toEqual(
          {tooltipMode: 'default', lineMode: 'linear', axes: {x: {type: 'linear', key: 'x'}, y: {type: 'linear'}}, series: []}
        );
    }));
    
    it('should allow x axis key configuration', inject(function(n3utils) {
      expect(n3utils.sanitizeOptions(
        {tooltipMode: 'default', lineMode: 'linear', axes: {x: {key: 'foo'}}})).toEqual(
          {tooltipMode: 'default', lineMode: 'linear', axes: {x: {type: 'linear', key: 'foo'}, y: {type: 'linear'}}, series: []}
        );
    }));
  });

  describe('series', function() {
    it('should set series colors if none found', inject(function(n3utils) {
      expect(n3utils.sanitizeOptions(
        {series: [
          {y: 'value', color: 'steelblue', type: 'area', label: 'Pouet'},
          {y: 'otherValue', axis: 'y2'}
        ]}
      )).toEqual(
        {tooltipMode: 'default', lineMode: 'linear', axes: {x: {type: 'linear', key: 'x'}, y: {type: 'linear'}, y2: {type: 'linear'}}, series: [
          {y: 'value', color: 'steelblue', type: 'area', label: 'Pouet'},
          {y: 'otherValue', axis: 'y2', color: '#1f77b4'}
        ]}
      );
    }));
  });
});
