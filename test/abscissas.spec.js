describe('abscissas', function() {
  beforeEach(inject(function(n3utils) {
    spyOn(n3utils, 'getDefaultMargins').andReturn(
      {top: 20, right: 50, bottom: 30, left: 50}
    );
  }));
  
  describe('custom ticklabel formatter', function() {
    beforeEach(function() {
      scope.$apply(function() {
        scope.data = [
          {x: 0, value: 4}, {x: 1, value: 8}, {x: 2, value: 15},
          {x: 3, value: 16}, {x: 4, value: 23}, {x: 5, value: 42}
        ];
        
        var f = function(value) {
          // this is silly ^^
          return '#' + value*.1;
        };
        
        scope.options = {axes: {x: {labelFunction: f}}, series: [{y: 'value', color: '#4682b4'} ]};
      });
    });
    
    it('should configure x axis', function() {
      var xAxis = elm.find('svg').children()[0].childNodes[0];

      var ticks = xAxis.childNodes;

      expect(ticks.length).toBe(12);

      expect(ticks[0].textContent).toBe('#0');
      expect(ticks[10].textContent).toBe('#0.5');
    });
    
    it('should draw a line', function() {
      var content = elm.find('svg').children()[0].childNodes[2];
      var lineGroup = content.childNodes[0];

      var linePath = lineGroup.childNodes[0];
      expect(linePath.getAttribute('class')).toBe('line');
      expect(linePath.getAttribute('d'))
        .toBe('M0,414L162,378L324,315L486,306L648,243L810,72');
    });
  });
  
  describe('default key', function() {
    beforeEach(function() {
      scope.$apply(function() {
        scope.data = [
          {x: 0, value: 4}, {x: 1, value: 8}, {x: 2, value: 15},
          {x: 3, value: 16}, {x: 4, value: 23}, {x: 5, value: 42}
        ];

        scope.options = {series: [{y: 'value', color: '#4682b4'} ]};
      });
    });
    
    it('should configure x axis', function() {
      var xAxis = elm.find('svg').children()[0].childNodes[0];

      var ticks = xAxis.childNodes;

      expect(ticks.length).toBe(12);

      expect(ticks[0].textContent).toBe('0.0');
      expect(ticks[10].textContent).toBe('5.0');
    });
    
    it('should draw a line', function() {
      var content = elm.find('svg').children()[0].childNodes[2];
      var lineGroup = content.childNodes[0];

      var linePath = lineGroup.childNodes[0];
      expect(linePath.getAttribute('class')).toBe('line');
      expect(linePath.getAttribute('d'))
        .toBe('M0,414L162,378L324,315L486,306L648,243L810,72');
    });
  });
  
  describe('custom key', function() {
    beforeEach(function() {
       scope.$apply(function() {
        scope.data = [
          {foo: 0, value: 4}, {foo: 1, value: 8}, {foo: 2, value: 15},
          {foo: 3, value: 16}, {foo: 4, value: 23}, {foo: 5, value: 42}
        ];

        scope.options = {axes: {x: {key: 'foo'}}, series: [{y: 'value', color: '#4682b4'} ]};
      });
    });
    
    it('should properly configure x axis from custom key', function() {
      var xAxis = elm.find('svg').children()[0].childNodes[0];

      var ticks = xAxis.childNodes;

      expect(ticks.length).toBe(12);

      expect(ticks[0].textContent).toBe('0.0');
      expect(ticks[10].textContent).toBe('5.0');
    });
    
    it('should draw a line', function() {
      var content = elm.find('svg').children()[0].childNodes[2];
      var lineGroup = content.childNodes[0];

      var linePath = lineGroup.childNodes[0];
      expect(linePath.getAttribute('class')).toBe('line');
      expect(linePath.getAttribute('d'))
        .toBe('M0,414L162,378L324,315L486,306L648,243L810,72');
    });
  
  })
});
