describe('lineMode set to cardinal', function() {
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
    var content = svgGroup.childNodes[4];

    var areaGroup = content.childNodes[0];
    expect(areaGroup.getAttribute('class')).toBe('areaGroup series_0');
    expect(areaGroup.getAttribute('style').trim()).toBeSameStyleAs('fill: #4682b4;');

    var areaPath = areaGroup.childNodes[0];
    expect(areaPath.getAttribute('class')).toBe('area');
    expect(areaPath.getAttribute('d'))
      .toBe(
        'M0,414Q128.8,387.9,161,378C209.3,363.15,273.7,325.8,322,315S434.7,' +
        '316.8,483,306S595.7,278.1,644,243Q676.2,219.6,805,72L805,450Q676.2' +
        ',450,644,450C595.7,450,531.3,450,483,450S370.3,450,322,450S209.3,4' +
        '50,161,450Q128.8,450,0,450Z'
      );
  });

  it('should draw an interpolated line', function() {
    var content = elm.find('svg').children()[0].childNodes[4];
    var lineGroup = content.childNodes[1];

    var linePath = lineGroup.childNodes[0];
    expect(linePath.getAttribute('class')).toBe('line');
    expect(linePath.getAttribute('d'))
      .toBe(
        'M0,414Q128.8,387.9,161,378C209.3,363.15,273.7,325.8,322,315S434.7' +
        ',316.8,483,306S595.7,278.1,644,243Q676.2,219.6,805,72'
      );
  });

  it('should create a dots group with coordinates unchanged', function() {
    var svgGroup = elm.find('svg').children()[0];
    var content = svgGroup.childNodes[4];

    var dotsGroup = content.childNodes[2];
    expect(dotsGroup.nodeName).toBe('g');

    var dots = dotsGroup.childNodes;
    expect(dots.length).toBe(6);

    var expectedCoordinates = [
      {x: '0', y: '414'},
      {x: '161', y: '378'},
      {x: '322', y: '315'},
      {x: '483', y: '306'},
      {x: '644', y: '243'},
      {x: '805', y: '72'}
    ];

    for (var i = 0; i < dots.length; i++) {
      expect(dots[i].nodeName).toBe('circle');
      expect(dots[i].getAttribute('cx')).toBe(expectedCoordinates[i].x);
      expect(dots[i].getAttribute('cy')).toBe(expectedCoordinates[i].y);
    }
  });
});