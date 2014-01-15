describe('area series', function() {

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
        series: [{y: 'value', color: '#4682b4', type: 'area'} ]
      };
    });
  });

  it('should properly configure y axis', function() {
    var yAxis = elm.find('svg').children()[0].childNodes[2];

    var ticks = yAxis.childNodes;

    expect(ticks.length).toBe(11);

    expect(ticks[0].textContent).toBe('0');
    expect(ticks[9].textContent).toBe('45');
  });

  it('should properly configure x axis', function() {
    var xAxis = elm.find('svg').children()[0].childNodes[1];

    var ticks = xAxis.childNodes;

    expect(ticks.length).toBe(12);

    expect(ticks[0].textContent).toBe('0.0');
    expect(ticks[10].textContent).toBe('5.0');
  });

  it('should create 3 elements', function() {
    var svgGroup = elm.find('svg').children()[0];
    var content = svgGroup.childNodes[3];
    expect(content.childNodes.length).toBe(3);
  });

  it('should create an area group', function() {
    var svgGroup = elm.find('svg').children()[0];
    var content = svgGroup.childNodes[3];
    var areaGroup = content.childNodes[0];
    expect(areaGroup.getAttribute('class')).toBe('areaGroup series_0');
    expect(areaGroup.getAttribute('style')).toBe(null);

    var areaPath = areaGroup.childNodes[0];
    expect(areaPath.getAttribute('style').trim()).toBe('fill: #4682b4; opacity: 0.3;');
    expect(areaPath.getAttribute('class')).toBe('area');
    expect(areaPath.getAttribute('d'))
      .toBe('M0,410L162,370L324,300L486,290L648,220L810,30L810,450L648,450L486,450L324,450L162,450L0,450Z');
  });

  it('should create stripes pattern when told so', function() {
    scope.$apply(function() {
      scope.options = {
        series: [{y: 'value', color: '#4582b4', type: 'area', striped: true} ]
      };
    });

    var svgChildren = elm.find('svg').children();


    var patterns = svgChildren[0].childNodes[0];

    expect(patterns.getAttribute('class')).toBe('patterns');
    expect(patterns.childNodes.length).toBe(1);

    var pattern = patterns.childNodes[0];
    expect(pattern.getAttribute('id')).toBe('areaPattern_0');

    var patternGroup = pattern.childNodes[0];
    expect(patternGroup.getAttribute('style').trim()).toBeSameStyleAs('fill: #4582b4; fill-opacity: 0.3;');
  });

  it('should link pattern to fill style', function() {
    scope.$apply(function() {
      scope.options = {
        series: [{y: 'value', color: '#4582b4', type: 'area', striped: true} ]
      };
    });

    var svgChildren = elm.find('svg').children();

    var svgGroup = svgChildren[0];

    var content = svgGroup.childNodes[3];
    var areaGroup = content.childNodes[0];
    expect(areaGroup.getAttribute('class')).toBe('areaGroup series_0');
    expect(areaGroup.getAttribute('style')).toBe(null);

    var areaPath = areaGroup.childNodes[0];
    expect(areaPath.getAttribute('style').trim()).toBeSameStyleAs('fill: url(#areaPattern_0); opacity: 1;');
    expect(areaPath.getAttribute('class')).toBe('area');
    expect(areaPath.getAttribute('d'))
      .toBe('M0,410L162,370L324,300L486,290L648,220L810,30L810,450L648,450L486,450L324,450L162,450L0,450Z');
  });

  it('should create a line group', function() {
    var svgGroup = elm.find('svg').children()[0];
    var content = svgGroup.childNodes[3];

    var lineGroup = content.childNodes[1];
    expect(lineGroup.getAttribute('class')).toBe('lineGroup series_0');
    expect(lineGroup.getAttribute('style').trim()).toBeSameStyleAs('stroke: #4682b4;');
  });

  it('should create a dots group', function() {
    var svgGroup = elm.find('svg').children()[0];
    var content = svgGroup.childNodes[3];

    var dotsGroup = content.childNodes[2];
    expect(dotsGroup.nodeName).toBe('g');

    var dots = dotsGroup.childNodes;
    expect(dots.length).toBe(6);

    var expectedX = "X 0 162 324 486 648 810";
    var expectedY = "Y 410 370 300 290 220 30";
    
    var computedX = Array.prototype.reduce.call(dots, function(a, b) {
      return a + ' ' + b.getAttribute('cx');
    }, 'X');
    
    var computedY = Array.prototype.reduce.call(dots, function(a, b) {
      return a + ' ' + b.getAttribute('cy');
    }, 'Y');

    for (var i = 0; i < dots.length; i++) {
      expect(dots[i].nodeName).toBe('circle');
    }
    
    expect(computedX).toEqual(expectedX);
    expect(computedY).toEqual(expectedY);
  });
});
