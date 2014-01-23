describe('column series', function() {
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

      scope.options = {series: [{y: 'value', color: '#4682b4', type: 'column'}]};
    });
  });

  it('should properly configure y axis', function() {
    var yAxis = elm.find('svg').children()[0].childNodes[2];

    var ticks = yAxis.childNodes;

    expect(ticks.length).toBe(11);

    expect(ticks[0].textContent).toBe('0');
    expect(ticks[9].textContent).toBe('45');
  });

  it('should configure x axis with extra space', function() {
    var xAxis = elm.find('svg').children()[0].childNodes[1];

    var ticks = xAxis.childNodes;

    expect(ticks.length).toBe(9);

    expect(ticks[0].textContent).toBe('0');
    expect(ticks[7].textContent).toBe('6');
  });

  it('should create a group', function() {
    var svgGroup = elm.find('svg').children()[0];

    var content = svgGroup.childNodes[3];
    expect(content.getAttribute('class')).toBe('content');
    expect(content.childNodes.length).toBe(1);

    var lineGroup = content.childNodes[0];
    expect(lineGroup.getAttribute('class')).toBe('columnGroup series_0');
    expect(lineGroup.getAttribute('style').trim()).toBeSameStyleAs('fill: #4682b4; fill-opacity: 0.8;');
  });

  it('should draw columns', function() {
    var svgGroup = elm.find('svg').children()[0];
    var content = svgGroup.childNodes[3];
    var columnGroup = content.childNodes[0];
    expect(columnGroup.nodeName).toBe('g');

    var columns = columnGroup.childNodes;
    expect(columns.length).toBe(6);
    
    var fn = function(att) {return function(a, b) {return a + ' ' + b.getAttribute(att);}};
    var computedX = Array.prototype.reduce.call(columns, fn('x'), 'X');
    var computedY = Array.prototype.reduce.call(columns, fn('y'), 'Y');
    var computedH = Array.prototype.reduce.call(columns, fn('height'), 'H');
    
    expect(computedX).toEqual("X 116 231 347 463 579 694");
    expect(computedY).toEqual("Y 410 370 300 290 220 30");
    expect(computedH).toEqual("H 40 80 150 160 230 420");

    for (var i = 0; i < columns.length; i++) {
      expect(columns[i].nodeName).toBe('rect');
      expect(columns[i].style['fill-opacity']).toBe('1');
    }
  });
  
  it('should draw zero value columns with full height and opacity to zero', function() {
    scope.$apply(function() {
      scope.data = [
        {x: 0, value: 0}, {x: 1, value: 8}, {x: 2, value: 15},
        {x: 3, value: 16}, {x: 4, value: 23}, {x: 5, value: 42}
      ];

      scope.options = {series: [{y: 'value', color: '#4682b4', type: 'column'}]};
    });
    
    var svgGroup = elm.find('svg').children()[0];
    var content = svgGroup.childNodes[3];
    var columnGroup = content.childNodes[0];
    expect(columnGroup.nodeName).toBe('g');

    var columns = columnGroup.childNodes;
    expect(columns.length).toBe(6);

    var expectedOpacities = ['0', '1', '1', '1', '1', '1'];

    var fn = function(att) {return function(a, b) {return a + ' ' + b.getAttribute(att);}};
    var computedX = Array.prototype.reduce.call(columns, fn('x'), 'X');
    var computedY = Array.prototype.reduce.call(columns, fn('y'), 'Y');
    var computedH = Array.prototype.reduce.call(columns, fn('height'), 'H');
    
    expect(computedX).toEqual("X 116 231 347 463 579 694");
    expect(computedY).toEqual("Y 0 370 300 290 220 30");
    expect(computedH).toEqual("H 450 80 150 160 230 420");
    

    for (var i = 0; i < columns.length; i++) {
      expect(columns[i].nodeName).toBe('rect');
      expect(columns[i].style['fill-opacity']).toBe(expectedOpacities[i]);
    }
  });
});
