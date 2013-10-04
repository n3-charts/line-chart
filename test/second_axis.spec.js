describe('with a second axis', function() {
  beforeEach(inject(function(n3utils) {
    spyOn(n3utils, 'getDefaultMargins').andReturn(
      {top: 20, right: 50, bottom: 30, left: 50}
      );
  }));

  beforeEach(function() {
    scope.$apply(function() {
      scope.data = [
        {x: 0, value: 4, foo: -2}, {x: 1, value: 8, foo: 22}, {x: 2, value: 15, foo: -1},
        {x: 3, value: 16, foo: 0}, {x: 4, value: 23, foo: -3}, {x: 5, value: 42, foo: -4}
      ];

      scope.options = {
        series: [
          {axis: 'y', y: 'value', color: '#4682b4', type: 'area'},
          {axis: 'y2', y: 'foo', color: 'steelblue', type: 'area'}
        ]
      };
    });
  });

  it('should configure y axis only with y series', function() {
    var yAxis = elm.find('svg').children()[0].childNodes[1];

    var ticks = yAxis.childNodes;

    expect(ticks.length).toBe(12);

    expect(ticks[0].textContent).toBe('0');
    expect(ticks[10].textContent).toBe('50');
  });

  it('should properly configure y2 axis', function() {
    var y2Axis = elm.find('svg').children()[0].childNodes[2];

    var ticks = y2Axis.childNodes;

    expect(ticks.length).toBe(15);

    expect(ticks[0].textContent).toBe('0');
    expect(ticks[10].textContent).toBe('16');
  });

  it('should draw two lines', function() {
    var content = elm.find('svg').children()[0].childNodes[3];

    var leftLinePath = content.childNodes[2].childNodes[0];
    expect(leftLinePath.getAttribute('class')).toBe('line');
    expect(leftLinePath.getAttribute('d'))
      .toBe('M0,414L162,378L324,315L486,306L648,243L810,72');

    var rightLinePath = content.childNodes[3].childNodes[0];
    expect(rightLinePath.getAttribute('class')).toBe('line');
    expect(rightLinePath.getAttribute('d'))
      .toBe('M0,415L162,0L324,398L486,381L648,433L810,450');
  });

  it('should draw y area', function() {
    var content = elm.find('svg').children()[0].childNodes[3];

    var areaGroup = content.childNodes[0];
    expect(areaGroup.getAttribute('class')).toBe('areaGroup series_0');
    expect(areaGroup.getAttribute('style').trim()).toBeSameStyleAs('fill: #4682b4;');

    var areaPath = areaGroup.childNodes[0];
    expect(areaPath.getAttribute('class')).toBe('area');
    expect(areaPath.getAttribute('d'))
      .toBe('M0,414L162,378L324,315L486,306L648,243L810,72L810,450L648,' +
        '450L486,450L324,450L162,450L0,450Z');
  });

  it('should draw y2 area', function() {
    var content = elm.find('svg').children()[0].childNodes[3];

    var areaGroup = content.childNodes[1];
    expect(areaGroup.getAttribute('class')).toBe('areaGroup series_1');
    expect(areaGroup.getAttribute('style').trim()).toBeSameStyleAs('fill: #4682b4;');

    var areaPath = areaGroup.childNodes[0];
    expect(areaPath.getAttribute('class')).toBe('area');
    expect(areaPath.getAttribute('d'))
      .toBe('M0,415L162,0L324,398L486,381L648,433L810,450L810,381L648,' +
        '381L486,381L324,381L162,381L0,381Z');
  });

  it('should draw y axis dots', function() {
    var content = elm.find('svg').children()[0].childNodes[3];

    var leftDotsGroup = content.childNodes[4];
    expect(leftDotsGroup.nodeName).toBe('g');

    var dots = leftDotsGroup.childNodes;
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

  it('should draw y2 axis dots', function() {
    var content = elm.find('svg').children()[0].childNodes[3];

    var leftDotsGroup = content.childNodes[5];
    expect(leftDotsGroup.nodeName).toBe('g');

    var dots = leftDotsGroup.childNodes;
    expect(dots.length).toBe(6);

    var expectedCoordinates = [
      {x: '0', y: '415'},
      {x: '162', y: '0'},
      {x: '324', y: '398'},
      {x: '486', y: '381'},
      {x: '648', y: '433'},
      {x: '810', y: '450'}
    ];

    for (var i = 0; i < dots.length; i++) {
      expect(dots[i].nodeName).toBe('circle');
      expect(dots[i].getAttribute('cx')).toBe(expectedCoordinates[i].x);
      expect(dots[i].getAttribute('cy')).toBe(expectedCoordinates[i].y);
    }
  });
});
