'use strict';

describe('n3-linechart', function() {
  var elm, scope;

  beforeEach(module('n3-charts.linechart'));

  beforeEach(inject(function($rootScope, $compile) {
    elm = angular.element('<div><linechart></linechart></div>');

    scope = $rootScope;
    $compile(elm)(scope);
    scope.$digest();
  }));
  
  it('should create exactly one svg element', inject(function($compile, $rootScope) {
    expect(elm.find('svg').length).toBe(1);
  }));
})