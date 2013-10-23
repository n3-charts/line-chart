describe('thumbnail mode', function() {
  beforeEach(inject(function($rootScope, $compile) {
    elm = angular.element('<div id="toto">' +
      '<linechart data="data" options="options" mode="thumbnail"></linechart>' +
      '</div>');

    scope = $rootScope;
    $compile(elm)(scope);
    scope.$digest();

    scope.$apply(function() {
      scope.data = [
        {x: 0, value: 4}, {x: 1, value: 8}, {x: 2, value: 15},
        {x: 3, value: 16}, {x: 4, value: 23}, {x: 5, value: 42}
      ];

      scope.options = {
        series: [{y: 'value', color: '#4682b4'} ]
      };
    });
  }));

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

  it('should create only content', function() {
    scope.$apply(function() {
      scope.options = {series: [
        {axis: 'y', y: 'value', color: '#4682b4'},
        {axis: 'y2', y: 'value', color: '#4682b4'}
      ]};
    });

    var svgGroup = elm.find('svg').children()[0];

    var content = svgGroup.childNodes;
    expect(content.length).toBe(3);

    expect(content[0].getAttribute('class')).toBe('patterns');
    expect(content[1].getAttribute('class')).toBe('content');
    expect(content[2].getAttribute('id')).toBe('clip');
  });

  describe('line series', function() {
    it('should create a group', function() {
      var svgGroup = elm.find('svg').children()[0];

      var content = svgGroup.childNodes[1];
      expect(content.childNodes.length).toBe(1);

      var lineGroup = content.childNodes[0];
      expect(lineGroup.getAttribute('class')).toBe('lineGroup series_0');
      expect(lineGroup.getAttribute('style').trim()).toBeSameStyleAs('stroke: #4682b4;');
    });

    it('should only draw a line', function() {
      var content = elm.find('svg').children()[0].childNodes[1];
      var lineGroup = content.childNodes[0];

      var linePath = lineGroup.childNodes[0];
      expect(linePath.getAttribute('class')).toBe('line');
      expect(linePath.getAttribute('d'))
        .toBe('M0,423L178,386L356,322L534,313L712,248L890,74');
    });
  });

  describe('area series', function() {
    beforeEach(function() {
      scope.$apply(function() {
        scope.options = {series: [
          {axis: 'y', y: 'value', type: 'area', color: 'blue'}
        ]};
      });
    });

    it('should create a group and draw an area', function() {
      var svgGroup = elm.find('svg').children()[0];

      var content = svgGroup.childNodes[1];
      expect(content.childNodes.length).toBe(2);

      var areaGroup = content.childNodes[0];
      expect(areaGroup.getAttribute('class')).toBe('areaGroup series_0');
      expect(areaGroup.getAttribute('style')).toBe(null);

      var areaPath = areaGroup.childNodes[0];
      expect(areaPath.getAttribute('style').trim()).toBe('fill: #0000ff; opacity: 0.3;');
      expect(areaPath.getAttribute('class')).toBe('area');
      expect(areaPath.getAttribute('d'))
        .toBe('M0,423L178,386L356,322L534,313L712,248L890,74L890,460L712,460L534,460L356,460L178,460L0,460Z');
    });

    it('should draw a line', function() {
      var svgGroup = elm.find('svg').children()[0];

      var content = svgGroup.childNodes[1];
      expect(content.childNodes.length).toBe(2);
      var lineGroup = content.childNodes[1];

      var linePath = lineGroup.childNodes[0];
      expect(linePath.getAttribute('class')).toBe('line');
      expect(linePath.getAttribute('d'))
        .toBe('M0,423L178,386L356,322L534,313L712,248L890,74');
    });
  });
});
