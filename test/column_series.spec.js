describe('column series', function() {
  beforeEach(function() {
    scope.$apply(function() {
      scope.data = [
        {x: 0, value: 4}, {x: 1, value: 8}, {x: 2, value: 15},
        {x: 3, value: 16}, {x: 4, value: 23}, {x: 5, value: 42}
      ];

      scope.options = {series: [{y: 'value', color: '#4682b4', type: 'column'}]};
    });
  });

  it('should properly configure y axis', function() {
    var yAxis = elm.find('svg').children()[0].childNodes[1];

    var ticks = yAxis.childNodes;

    expect(ticks.length).toBe(12);

    expect(ticks[0].textContent).toBe('0');
    expect(ticks[10].textContent).toBe('50');
  });

  it('should configure x axis with extra space', function() {
    var xAxis = elm.find('svg').children()[0].childNodes[0];

    var ticks = xAxis.childNodes;

    expect(ticks.length).toBe(9);

    expect(ticks[0].textContent).toBe('0');
    expect(ticks[7].textContent).toBe('6');
  });

  it('should create a group', function() {
    var svgGroup = elm.find('svg').children()[0];

    var content = svgGroup.childNodes[4];
    expect(content.getAttribute('class')).toBe('content');
    expect(content.childNodes.length).toBe(1);

    var lineGroup = content.childNodes[0];
    expect(lineGroup.getAttribute('class')).toBe('columnGroup series_0');
    expect(lineGroup.getAttribute('style').trim()).toBeSameStyleAs('fill: #4682b4; fill-opacity: 0.8;');
  });

  it('should draw columns', function() {
    var svgGroup = elm.find('svg').children()[0];
    var content = svgGroup.childNodes[4];
    var columnGroup = content.childNodes[0];
    expect(columnGroup.nodeName).toBe('g');

    var columns = columnGroup.childNodes;
    expect(columns.length).toBe(6);

    var expectedCoordinates = [
      {x: '115', y: '414'},
      {x: '230', y: '378'},
      {x: '345', y: '315'},
      {x: '460', y: '306'},
      {x: '575', y: '243'},
      {x: '690', y: '72'}
    ];

    for (var i = 0; i < columns.length; i++) {
      expect(columns[i].nodeName).toBe('rect');
      expect(columns[i].getAttribute('x')).toBe(expectedCoordinates[i].x);
      expect(columns[i].getAttribute('y')).toBe(expectedCoordinates[i].y);
    }
  });
});