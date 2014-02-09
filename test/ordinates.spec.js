describe('ordinates', function() {
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

        var f2 = function(value) {
          return "$" + value;
        };

        scope.options = {
          axes: {y: {labelFunction: f}, y2: {labelFunction: f2}},
          series: [{y: 'value', color: '#4682b4'}, {y: 'x', color: '#4682b4', axis: 'y2'}]};
      });
    });

    it('should configure y axis', function() {
      var yAxis = elm.find('svg').children()[0].childNodes[2];

      var ticks = yAxis.childNodes;
      expect(ticks.length).toBe(11);

      expect(ticks[0].textContent).toBe('#0');
      expect(ticks[9].textContent).toBe('#4.5');
    });

    it('should configure y2 axis', function() {
      var y2Axis = elm.find('svg').children()[0].childNodes[3];

      var ticks = y2Axis.childNodes;
      expect(ticks.length).toBe(12);

      expect(ticks[0].textContent).toBe('$0');
      expect(ticks[10].textContent).toBe('$5');
    });
  });
});
