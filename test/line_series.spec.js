describe('line series', function() {
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

      scope.options = {series: [{y: 'value', color: '#4682b4', thickness: "3px"} ]};
    });
  });

  it('should properly configure y axis', function() {
    var yAxis = elm.find('svg').children()[0].childNodes[2];

    var ticks = yAxis.childNodes;

    expect(ticks.length).toBe(11);

    expect(ticks[0].textContent).toBe('0');
    expect(ticks[9].textContent).toBe('45');
  });

  it('should create a group', function() {
    var svgGroup = elm.find('svg').children()[0];

    var content = svgGroup.childNodes[3];
    expect(content.childNodes.length).toBe(2);

    var lineGroup = content.childNodes[0];
    expect(lineGroup.getAttribute('class')).toBe('lineGroup series_0');
    expect(lineGroup.getAttribute('style').trim()).toBeSameStyleAs('stroke: #4682b4;');
  });

  it('should draw dots', function() {
    var svgGroup = elm.find('svg').children()[0];
    var content = svgGroup.childNodes[3];
    var dotsGroup = content.childNodes[1];
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

  it('should draw a line', function() {
    var content = elm.find('svg').children()[0].childNodes[3];
    var lineGroup = content.childNodes[0];

    var linePath = lineGroup.childNodes[0];
    expect(linePath.getAttribute('class')).toBe('line');

    expect(linePath.getAttribute('style')).toBe("fill: none; stroke-width: 3px;");


    expect(linePath.getAttribute('d'))
      .toBe('M0,410L162,370L324,300L486,290L648,220L810,30');
  });
});
