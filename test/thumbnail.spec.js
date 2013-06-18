describe('thumbnail when initializing', function() {
  beforeEach(inject(function($rootScope, $compile) {
    elm = angular.element('<div id="toto">' +
      '<linechart mode="thumbnail"></linechart>' +
      '</div>');

    scope = $rootScope;
    $compile(elm)(scope);
    scope.$digest();
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

  it('should draw zero axes', function() {
    var svgGroup = elm.find('svg').children()[0];

    var content = svgGroup.childNodes;
    expect(content.length).toBe(2);
  });
});
