describe('scales', function() {
  
  describe('logarithmic y axes', function() {
    beforeEach(function() {
      scope.$apply(function() {
        scope.data = [{x: 0, value: 4}, {x: 1, value: 8}];

        scope.options = {
          axes: {
            y: {type: 'log'}
          },
          series: [
          {y: 'value', color: '#4682b4', label: 'toto'},
          {y: 'value', axis: 'y2', color: '#4682b4', type: 'column'}
        ]};
      });
    });
    
    it('should prevent log(0) from happening', function() {
      scope.$apply(function() {
        scope.data = [{x: 0, value: 0}, {x: 1, value: 80000}, {x: 2, value: 100000}, {x: 3, value: 30000}];
        
        scope.options = {
          axes: {
            y: {type: 'log'},
            y2: {type: 'log'}
          },
          series: [
          {y: 'value', color: '#4682b4', label: 'toto'},
          {y: 'value', axis: 'y2', color: '#4682b4', type: 'column'}
        ]};
      });
      
      var expectedTicks = [ '1e+0', '', '', '', '', '', '', '', '', '1e+1',
        '', '', '', '', '', '', '', '', '1e-2',
        '', '', '', '', '', '', '', '', '1e-1',
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '1e+2',
        '', '', '', '', '', '', '', '', '1e+3',
        '', '', '', '', '', '', '', '', '1e+4',
        '', '', '', '', '', '', '', '', '1e+5', ''
      ];
      
      var yAxis = elm.find('svg').children()[0].childNodes[2];
      var computedYTicks = [];
      for (var i = 0; i < yAxis.childNodes.length; i++) {
        computedYTicks.push(yAxis.childNodes[i].textContent);
      }
      
      var y2Axis = elm.find('svg').children()[0].childNodes[3];
      var computedY2Ticks = [];
      for (var i = 0; i < y2Axis.childNodes.length; i++) {
        computedY2Ticks.push(y2Axis.childNodes[i].textContent);
      }
      
      expect(computedYTicks).toEqual(expectedTicks);
      expect(computedY2Ticks).toEqual(expectedTicks);
    });
    
    it('should configure y axis with logarithmic values', function() {
      var yAxis = elm.find('svg').children()[0].childNodes[2];

      var ticks = yAxis.childNodes;

      var expectedTicks = [ '1e+0', '2e+0', '3e+0', '4e+0', '5e+0', '6e+0', '7e+0', '8e+0', '9e+0', '1e+1', '' ];
      var computedTicks = [];
      
      for (var i = 0; i < ticks.length; i++) {
        computedTicks.push(ticks[i].textContent);
      }
      
      expect(computedTicks).toEqual(expectedTicks);
    });
    
    it('should configure y2 axis with logarithmic values', function() {
      scope.$apply(function() {
        scope.options = {
          axes: {
            y2: {type: 'log'}
          },
          series: [
          {y: 'value', color: '#4682b4', label: 'toto'},
          {y: 'value', axis: 'y2', color: '#4682b4', type: 'column'}
        ]};
      });
      
      var y2Axis = elm.find('svg').children()[0].childNodes[3];

      var ticks = y2Axis.childNodes;

      var expectedTicks = [ '1e+0', '2e+0', '3e+0', '4e+0', '5e+0', '6e+0', '7e+0', '8e+0', '9e+0', '1e+1', '' ];
      var computedTicks = [];
      
      for (var i = 0; i < ticks.length; i++) {
        computedTicks.push(ticks[i].textContent);
      }
      
      expect(computedTicks).toEqual(expectedTicks);
    });

    it('should let y2 axis in linear mode if told so', function() {
      var y2Axis = elm.find('svg').children()[0].childNodes[3];

      var ticks = y2Axis.childNodes;
      
      var expectedTicks = ['4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0', '7.5', '8.0', ''];
      var computedTicks = [];
      
      for (var i = 0; i < ticks.length; i++) {
        computedTicks.push(ticks[i].textContent);
      }
      
      expect(computedTicks).toEqual(expectedTicks);
    });
    
  });
});
