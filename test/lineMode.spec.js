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
    expect(areaGroup.getAttribute('style')).toBe(null);

    var areaPath = areaGroup.childNodes[0];
    expect(areaPath.getAttribute('style').trim()).toBeSameStyleAs('fill: #4682b4;opacity: 0.3;');
    expect(areaPath.getAttribute('class')).toBe('area');

    expect(areaPath.getAttribute('d'))
      .toBe(
        'M0,410Q129.6,381,162,370C210.60000000000002,353.5,275.4,312,324,300S' +
        '437.4,302,486,290S599.4,259,648,220Q680.4,194,810,30L810,450Q680.4,4' +
        '50,648,450C599.4,450,534.6,450,486,450S372.6,450,324,450S210.6000000' +
        '0000002,450,162,450Q129.6,450,0,450Z'
      );
  });

  it('should draw an interpolated area regarding the line tension', function() {
    scope.$apply(function() {
      scope.options = {
        lineMode: 'cardinal', tension: 0.2,
        series: [{y: 'value', color: '#4682b4', type: 'area'} ]
      };
    });

    var svgGroup = elm.find('svg').children()[0];
    var content = svgGroup.childNodes[3];

    var areaGroup = content.childNodes[0];
    expect(areaGroup.getAttribute('class')).toBe('areaGroup series_0');
    expect(areaGroup.getAttribute('style')).toBe(null);

    var areaPath = areaGroup.childNodes[0];
    expect(areaPath.getAttribute('style').trim()).toBeSameStyleAs('fill: #4682b4;opacity: 0.3;');
    expect(areaPath.getAttribute('class')).toBe('area');

    expect(areaPath.getAttribute('d'))
      .toBe(
        'M0,410Q75.60000000000001,399.3333333333333,162,370C291.6,326,194.4,3' +
        '32,324,300S356.4,322,486,290S518.4,324,648,220Q734.4,150.66666666666' +
        '669,810,30L810,450Q734.4,450,648,450C518.4,450,615.6,450,486,450S453' +
        '.6,450,324,450S291.6,450,162,450Q75.60000000000001,450,0,450Z'
      );
  });

  it('should draw an interpolated line', function() {
    var content = elm.find('svg').children()[0].childNodes[3];
    var lineGroup = content.childNodes[1];

    var linePath = lineGroup.childNodes[0];
    expect(linePath.getAttribute('class')).toBe('line');
    expect(linePath.getAttribute('d'))
      .toBe(
        'M0,410Q129.6,381,162,370C210.60000000000002,353.5,275.4,312,324,300S' +
        '437.4,302,486,290S599.4,259,648,220Q680.4,194,810,30'
      );
  });

  it('should create a dots group with coordinates unchanged', function() {
    var svgGroup = elm.find('svg').children()[0];
    var content = svgGroup.childNodes[3];

    var dotsGroup = content.childNodes[2];
    expect(dotsGroup.nodeName).toBe('g');

    var dots = dotsGroup.childNodes;
    expect(dots.length).toBe(6);

    var fn = function(att) {return function(a, b) {return a + ' ' + b.getAttribute(att);}};
    var computedX = Array.prototype.reduce.call(dots, fn('cx'), 'X');
    var computedY = Array.prototype.reduce.call(dots, fn('cy'), 'Y');

    expect(computedX).toEqual("X 0 162 324 486 648 810");
    expect(computedY).toEqual("Y 410 370 300 290 220 30");

    for (var i = 0; i < dots.length; i++) {
      expect(dots[i].nodeName).toBe('circle');
    }
  });
});
