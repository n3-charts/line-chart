describe('tooltip', function() {
  var ttSpy;
  beforeEach(function() {
    scope.$apply(function() {
      scope.data = [{x: 0, value: 4}, {x: 1, value: 8}];

      ttSpy = jasmine.createSpy('tooltipFormatter').andReturn('pouet');

      scope.options = {
        axes: {x: {tooltipFormatter: ttSpy}},
        series: [
        {y: 'value', color: '#4682b4'},
        {y: 'value', axis: 'y2', color: '#4682b4', type: 'column'}
      ]};
    });
  });

  it('should show/hide the tooltip when hovering/leaving a left axis dot', function() {
    var svgGroup = elm.find('svg').children()[0];

    var content = svgGroup.childNodes;

    var leftAxisDotGroup = content[4].childNodes[2];

    expect(leftAxisDotGroup.getAttribute('class')).toBe('dotGroup series_0');

    var xTooltip = content[7];
    expect(xTooltip.getAttribute('id')).toBe('xTooltip');

    var e = document.createEvent("MouseEvents");
    e.initMouseEvent("mouseover", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

    leftAxisDotGroup.dispatchEvent(e);

    e.initMouseEvent("mouseout", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    leftAxisDotGroup.dispatchEvent(e);

    expect(ttSpy).toHaveBeenCalled();
  });

  it('should work when no x-formatter is found', function() {
    scope.$apply(function() {
      scope.options = {
        series: [
        {y: 'value', color: '#4682b4'},
        {y: 'value', axis: 'y2', color: '#4682b4', type: 'column'}
      ]};
    });

    var svgGroup = elm.find('svg').children()[0];

    var content = svgGroup.childNodes;

    var leftAxisDotGroup = content[4].childNodes[2];

    expect(leftAxisDotGroup.getAttribute('class')).toBe('dotGroup series_0');

    var xTooltip = content[7];
    expect(xTooltip.getAttribute('id')).toBe('xTooltip');

    var e = document.createEvent("MouseEvents");
    e.initMouseEvent("mouseover", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

    leftAxisDotGroup.dispatchEvent(e);

    e.initMouseEvent("mouseout", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    leftAxisDotGroup.dispatchEvent(e);
  });


  it('should show/hide the tooltip when hovering/leaving a right axis column', function() {
    var svgGroup = elm.find('svg').children()[0];

    var content = svgGroup.childNodes;

    var rightAxisColumnGroup = content[4].childNodes[0];

    expect(rightAxisColumnGroup.getAttribute('class')).toBe('columnGroup series_1');

    var xTooltip = content[7];
    expect(xTooltip.getAttribute('id')).toBe('xTooltip');

    var e = document.createEvent("MouseEvents");
    e.initMouseEvent("mouseover", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    rightAxisColumnGroup.dispatchEvent(e);

    e.initMouseEvent("mouseout", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    rightAxisColumnGroup.dispatchEvent(e);
  });
});
