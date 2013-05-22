describe('time series', function() {
  beforeEach(function() {
    var then = 1369145776795;
    
    scope.$apply(function() {
      scope.data = [
        {x: new Date(then + 0*3600), value: 4, foo: -2},
        {x: new Date(then + 1*3600), value: 8, foo: 22},
        {x: new Date(then + 2*3600), value: 15, foo: -1},
        {x: new Date(then + 3*3600), value: 16, foo: 0},
        {x: new Date(then + 4*3600), value: 23, foo: -3},
        {x: new Date(then + 5*3600), value: 42, foo: -4}
      ];
      
      scope.options = {
        axes: {x: {type: 'date'}},
        series: [
          {axis: 'y', y: 'value', color: '#4682b4', type: 'column'},
          {axis: 'y2', y: 'foo', color: 'steelblue', type: 'area'}
        ]
      };
    });
    
  });
  
  it('should properly configure x axis', function() {
    var xAxis = elm.find('svg').children()[0].childNodes[0];

    var ticks = xAxis.childNodes;
    
    expect(ticks.length).toBe(6);

    expect(ticks[0].textContent).toBe(':15');
    expect(ticks[4].textContent).toBe(':35');
  });
});
