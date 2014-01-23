describe('chart initialization', function() {
  it('should create one svg element', function() {
    expect(elm[0].getAttribute('id')).toBe('toto');

    var templateElmts = elm[0].children;
    expect(templateElmts.length).toBe(1);
    expect(templateElmts[0].nodeName).toBe('DIV'); // this is the template's div
    expect(templateElmts[0].getAttribute('class')).toBe('ng-isolate-scope chart');

    var dynamicChildren = templateElmts[0].children;
    expect(dynamicChildren.length).toBe(1);
    expect(dynamicChildren[0].nodeName).toBe('svg');
  });

  it('should draw two axes by default', function() {
    var svgGroup = elm.find('svg').children()[0];

    var content = svgGroup.childNodes;
    expect(content.length).toBe(8);

    expect(content[0].getAttribute('class')).toBe('patterns');
    expect(content[1].getAttribute('class')).toBe('x axis');
    expect(content[2].getAttribute('class')).toBe('y axis');
    expect(content[6].getAttribute('id')).toBe('xTooltip');
    expect(content[7].getAttribute('id')).toBe('yTooltip');
  });

  it('should generate properly the main elements', function() {
    scope.$apply(function() {
      scope.options = {series: [
        {axis: 'y', y: 'value', color: '#4682b4'},
        {axis: 'y2', y: 'value', color: '#4682b4'}
      ]};
    });

    var svgGroup = elm.find('svg').children()[0];

    var content = svgGroup.childNodes;
    expect(content.length).toBe(10);

    expect(content[0].getAttribute('class')).toBe('patterns');
    expect(content[1].getAttribute('class')).toBe('x axis');
    expect(content[2].getAttribute('class')).toBe('y axis');
    expect(content[3].getAttribute('class')).toBe('y2 axis');
    expect(content[4].getAttribute('class')).toBe('content');
    expect(content[5].getAttribute('id')).toBe('clip');
    expect(content[6].getAttribute('class')).toBe('legend');
    expect(content[7].getAttribute('id')).toBe('xTooltip');
    expect(content[8].getAttribute('id')).toBe('yTooltip');
    expect(content[9].getAttribute('id')).toBe('y2Tooltip');
  });
});
