describe('options', function() {
  
  describe('axes', function() {
    it('should return default options when given null or undefined', inject(function(n3utils) {
      expect(n3utils.sanitizeOptions()).toEqual(
        {lineMode: 'linear', axes: {x: {type: 'linear'}, y: {type: 'linear'}}, series: []}
      );
    }));

    it('should set default axes and empty series', inject(function(n3utils) {
      expect(n3utils.sanitizeOptions({})).toEqual(
        {lineMode: 'linear', axes: {x: {type: 'linear'}, y: {type: 'linear'}}, series: []}
      );
    }));

    it('should set default x axis type to linear', inject(function(n3utils) {
      expect(n3utils.sanitizeOptions(
        {lineMode: 'linear', axes: {x: {}, y: {}}})).toEqual(
          {lineMode: 'linear', axes: {x: {type: 'linear'}, y: {type: 'linear'}}, series: []}
        );
    }));

    it('should set default y axis', inject(function(n3utils) {
      expect(n3utils.sanitizeOptions(
        {lineMode: 'linear', axes: {x: {}}})).toEqual(
          {lineMode: 'linear', axes: {x: {type: 'linear'}, y: {type: 'linear'}}, series: []}
        );
    }));

    it('should set default x axis', inject(function(n3utils) {
      expect(n3utils.sanitizeOptions(
        {lineMode: 'linear', axes: {}})).toEqual(
          {lineMode: 'linear', axes: {x: {type: 'linear'}, y: {type: 'linear'}}, series: []}
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
        {lineMode: 'linear', axes: {x: {type: 'linear'}, y: {type: 'linear'}, y2: {type: 'linear'}}, series: [
          {y: 'value', color: 'steelblue', type: 'area', label: 'Pouet'},
          {y: 'otherValue', axis: 'y2', color: '#1f77b4'}
        ]}
      );
    }));
  });

});
