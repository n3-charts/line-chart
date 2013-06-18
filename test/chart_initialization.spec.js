describe('chart when initializing', function() {
  it('should create one svg element', function() {
    expect(elm[0].getAttribute('id')).toBe('toto');

    var templateElmts = elm[0].children;
    expect(templateElmts.length).toBe(1);
    expect(templateElmts[0].nodeName).toBe('DIV'); // this is the template's div
    expect(templateElmts[0].getAttribute('class')).toBe('chart');

    var dynamicChildren = templateElmts[0].children;
    expect(dynamicChildren.length).toBe(1);
    expect(dynamicChildren[0].nodeName).toBe('svg');
  });

  it('should draw two axes by default', function() {
    var svgGroup = elm.find('svg').children()[0];

    var content = svgGroup.childNodes;
    expect(content.length).toBe(7);

    expect(content[0].getAttribute('class')).toBe('x axis');
    expect(content[1].getAttribute('class')).toBe('y axis');
    expect(content[2].getAttribute('id')).toBe('xTooltip');
    expect(content[3].getAttribute('id')).toBe('yTooltip');
  });

  it('should draw three axes whan said so', function() {
    scope.$apply(function() {
      scope.options = {series: [
        {axis: 'y', y: 'value', color: '#4682b4'},
        {axis: 'y2', y: 'value', color: '#4682b4'}
      ]};
    });

    var svgGroup = elm.find('svg').children()[0];

    var content = svgGroup.childNodes;
    expect(content.length).toBe(9);

    expect(content[0].getAttribute('class')).toBe('x axis');
    expect(content[1].getAttribute('class')).toBe('y axis');
    expect(content[2].getAttribute('class')).toBe('y2 axis');
    expect(content[3].getAttribute('id')).toBe('xTooltip');
    expect(content[4].getAttribute('id')).toBe('yTooltip');
    expect(content[5].getAttribute('id')).toBe('y2Tooltip');
  });

  xit('should draw data', function() {
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
});
