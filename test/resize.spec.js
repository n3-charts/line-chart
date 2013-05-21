describe('resize features', function() {
  beforeEach(inject(function($rootScope, $compile) {
    elm = angular.element('<div id="toto">' +
      '<linechart></linechart>' +
      '</div>');

    scope = $rootScope;
    $compile(elm)(scope);

    isolatedScope = angular.element(elm.children()[0]).scope();
    spyOn(isolatedScope, 'redraw');
    spyOn(isolatedScope, 'update').andCallThrough();

    scope.$digest();
  }));

  it('should update when $window resize', inject(function($window) {
    var e = document.createEvent('HTMLEvents');
    e.initEvent('resize', true, false);
    $window.dispatchEvent(e);
  }));

  it('should pass the new dimensions to redraw when $window is resized ',
  inject(function($window) {
    spyOn(isolatedScope, 'updateDimensions').andCallFake(function(d) {
      d.width = 120;
      d.height = 50;
    });

    // This could be better...
    var e = document.createEvent('HTMLEvents');
    e.initEvent('resize', true, false);
    $window.dispatchEvent(e);
  }));
});