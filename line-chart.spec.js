'use strict';

describe('n3-linechart', function() {
  var elm, scope;

  beforeEach(module('n3-charts.linechart'));

  beforeEach(inject(function($rootScope, $compile) {
    elm = angular.element('<div>' +
      '<linechart data="data" options="options"></linechart>' +
      '</div>');

    scope = $rootScope;
    $compile(elm)(scope);
    scope.$digest();
  }));
  
  
  it('should create exactly one svg element', inject(function($compile, $rootScope) {
    var svg = elm.find('svg');
    expect(svg.length).toBe(1);
  }));
  
  
  it('should create exactly two axes and one content group', inject(function($compile, $rootScope) {
    var svgGroup = elm.find('svg').children()[0];
    
    var content = svgGroup.childNodes;
    expect(content.length).toBe(3);
  }));
  
  describe('line drawing', function() {
    beforeEach(function() {
        scope.$apply(function() {
          scope.data = [
            {x: 0, value: 4},
            {x: 1, value: 8},
            {x: 2, value: 15},
            {x: 3, value: 16},
            {x: 4, value: 23},
            {x: 5, value: 42}
          ];
          
          scope.options = {series: [{y: 'value', color: '#4682b4'} ]}
        });
    })
    
    
    it('should properly configure y axis', inject(function($compile, $rootScope) {
      var yAxis = elm.find('svg').children()[0].childNodes[1];
      
      var ticks = yAxis.childNodes;
      
      expect(ticks.length).toBe(12);
      
      expect(ticks[0].textContent).toBe('0');
      expect(ticks[10].textContent).toBe('50');
    }));
    
    it('should properly configure x axis', inject(function($compile, $rootScope) {
      var xAxis = elm.find('svg').children()[0].childNodes[0];
      
      var ticks = xAxis.childNodes;
      
      expect(ticks.length).toBe(12);
      
      expect(ticks[0].textContent).toBe('0.0');
      expect(ticks[10].textContent).toBe('5.0');
    }));
    
    it('should create a group', inject(function($compile, $rootScope) {
      var svgGroup = elm.find('svg').children()[0];
      
      var content = svgGroup.childNodes[2];
      expect(content.childNodes.length).toBe(1);
      
      var lineGroup = content.childNodes[0];
      expect(lineGroup.getAttribute('class')).toBe('lineGroup');
      expect(lineGroup.getAttribute('style')).toBe('stroke: #4682b4;');
      
    }));
    
    it('should draw a line', inject(function($compile, $rootScope) {
      var content = elm.find('svg').children()[0].childNodes[2];
      var lineGroup = content.childNodes[0];
      
      var linePath = lineGroup.childNodes[0];
      expect(linePath.getAttribute('class')).toBe('line');
      expect(linePath.getAttribute('d'))
        .toBe('M0,414L160,378L320,315L480.00000000000006,306L640,243L800,72');
    }));
  })
})