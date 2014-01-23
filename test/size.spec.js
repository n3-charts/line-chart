describe('size', function() {
  beforeEach(inject(function($rootScope, $compile) {
    elm = angular.element('<div id="toto">' +
      '<linechart></linechart>' +
      '</div>');

    scope = $rootScope;
    $compile(elm)(scope);

    isolatedScope = angular.element(elm.children()[0]).isolateScope();
    
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

describe('size computation method', function() {
  it('should have default size', inject(function($rootScope, $compile) {
    elm = angular.element('<div id="toto">' +
      '<linechart></linechart>' +
      '</div>');

    scope = $rootScope;
    $compile(elm)(scope);

    isolatedScope = angular.element(elm.children()[0]).isolateScope();
    spyOn(isolatedScope, 'redraw');
    spyOn(isolatedScope, 'update').andCallThrough();

    scope.$digest();
    
    expect(isolatedScope.redraw.calls[1].args[0]).toEqual({
      top: 20,
      right: 50,
      bottom: 60,
      left: 50,
      width: 900,
      height: 500
    });
  }));
  
  it('should detect parent\'s top padding', inject(function($rootScope, $compile, n3utils) {
    var that = this;
    
    elm = angular.element('<div id="toto" style="padding-top: 50px">' +
      '<linechart></linechart>' +
      '</div>');

    scope = $rootScope;
    $compile(elm)(scope);

    isolatedScope = angular.element(elm.children()[0]).isolateScope();
    spyOn(isolatedScope, 'redraw');
    spyOn(isolatedScope, 'update').andCallThrough();
    
    spyOn(n3utils, 'getPixelCssProp').andCallFake(function(element, property) {
      if (element.id !== 'toto') {
        that.fail('Invalid id given to getPixelCssProp function');
      }
      
      if (['padding-top', 'padding-bottom', 'padding-left', 'padding-right'].indexOf(property) === -1) {
        that.fail('Invalid property given to getPixelCssProp function');
      }
      
      return {
        'padding-top': 50,
        'padding-bottom': 10,
        'padding-left': 20,
        'padding-right': 40
      }[property];
    });

    scope.$digest();
    
    
    expect(isolatedScope.redraw.calls[1].args[0]).toEqual({
      top: 20, right: 50, bottom: 60, left: 50, width: 840, height: 440
    });
  }));
});
