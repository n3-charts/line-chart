describe('lineMode set to cardinal', function() {
  beforeEach(inject(function(n3utils) {
    spyOn(n3utils, 'getDefaultMargins').andReturn(
      {top: 20, right: 50, bottom: 30, left: 50}
    );
  }));

  beforeEach(function() {
    scope.$apply(function() {
      scope.data = [
        {x: 0, value: 4}, {x: 1, value: 8}, {x: 2, value: 15},
        {x: 3, value: 16}, {x: 4, value: 23}, {x: 5, value: 42}
      ];

      scope.options = {
        lineMode: 'cardinal',
        series: [{y: 'value', color: '#4682b4', type: 'area'} ]
      };
    });
  });

  it('should draw an interpolated area', function() {
    var svgGroup = elm.find('svg').children()[0];
    var content = svgGroup.childNodes[3];

    var areaGroup = content.childNodes[0];
    expect(areaGroup.getAttribute('class')).toBe('areaGroup series_0');
    expect(areaGroup.getAttribute('style').trim()).toBeSameStyleAs('fill: #4682b4;');

    var areaPath = areaGroup.childNodes[0];
    expect(areaPath.getAttribute('class')).toBe('area');
    expect(areaPath.getAttribute('d'))
      .toBe(
        'M0,414Q129.6,387.9,162,378C210.60000000000002,363.15,275.4,325.8,324,' +
        '315S437.4,316.8,486,306S599.4,278.1,648,243Q680.4,219.6,810,72L810,' +
        '450Q680.4,450,648,450C599.4,450,534.6,450,486,450S372.6,450,324,' +
        '450S210.60000000000002,450,162,450Q129.6,450,0,450Z'
      );
  });

  it('should draw an interpolated line', function() {
    var content = elm.find('svg').children()[0].childNodes[3];
    var lineGroup = content.childNodes[1];

    var linePath = lineGroup.childNodes[0];
    expect(linePath.getAttribute('class')).toBe('line');
    expect(linePath.getAttribute('d'))
      .toBe(
        'M0,414Q129.6,387.9,162,378C210.60000000000002,363.15,275.4,325.8,' +
        '324,315S437.4,316.8,486,306S599.4,278.1,648,243Q680.4,219.6,810,72'
      );
  });

  it('should create a dots group with coordinates unchanged', function() {
    var svgGroup = elm.find('svg').children()[0];
    var content = svgGroup.childNodes[3];

    var dotsGroup = content.childNodes[2];
    expect(dotsGroup.nodeName).toBe('g');

    var dots = dotsGroup.childNodes;
    expect(dots.length).toBe(6);

    var expectedCoordinates = [
      {x: '0', y: '414'},
      {x: '162', y: '378'},
      {x: '324', y: '315'},
      {x: '486', y: '306'},
      {x: '648', y: '243'},
      {x: '810', y: '72'}
    ];

    for (var i = 0; i < dots.length; i++) {
      expect(dots[i].nodeName).toBe('circle');
      expect(dots[i].getAttribute('cx')).toBe(expectedCoordinates[i].x);
      expect(dots[i].getAttribute('cy')).toBe(expectedCoordinates[i].y);
    }
  });
});
