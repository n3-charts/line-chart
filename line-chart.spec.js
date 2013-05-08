'use strict';

describe('n3-linechart', function() {
  var elm, scope;

  beforeEach(module('n3-charts.linechart'));

  beforeEach(inject(function($rootScope, $compile) {
    elm = angular.element('<div id="toto">' +
      '<linechart data="data" options="options"></linechart>' +
      '</div>');

    scope = $rootScope;
    $compile(elm)(scope);
    scope.$digest();
  }));
  
  
  it('should create one svg element and one tooltip div', function() {
    expect(elm[0].getAttribute('id')).toBe('toto');
    
    var templateElmts = elm[0].children;
    expect(templateElmts.length).toBe(1);
    expect(templateElmts[0].nodeName).toBe('DIV'); // this is the template's div
    expect(templateElmts[0].getAttribute('class')).toBe('linechart');
    
    var dynamicChildren = templateElmts[0].children;
    expect(dynamicChildren.length).toBe(2);
    expect(dynamicChildren[0].nodeName).toBe('svg');
    
    
    expect(dynamicChildren[1].nodeName).toBe('DIV');
    expect(dynamicChildren[1].getAttribute('id')).toBe('tooltip');
  });
  
  
  it('should create exactly two axes and one content group', function() {
    var svgGroup = elm.find('svg').children()[0];
    
    var content = svgGroup.childNodes;
    expect(content.length).toBe(3);
  });
  
  describe('tooltip', function() {
    beforeEach(function() {
      scope.$apply(function() {
        scope.data = [{x: 0, value: 4}, {x: 1, value: 8}];
        
        scope.options = {series: [{y: 'value', color: '#4682b4'} ]}
      });
    })
    
    it('should show/hide the tooltip when hovering/leaving a dot', function() {
      var svgGroup = elm.find('svg').children()[0];
      var dots = svgGroup.childNodes[2].childNodes[1].childNodes;
      
      var tooltip = elm[0].children[0].children[1];
      expect(tooltip.getAttribute('id')).toBe('tooltip');
      expect(tooltip.getAttribute('class')).toBe('hidden');
      
      var e = document.createEvent('UIEvents');
      e.initUIEvent('mouseover');
      dots[0].dispatchEvent(e);
      
      expect(tooltip.getAttribute('class')).toBe('');
      
      e.initUIEvent('mouseout');
      dots[0].dispatchEvent(e);
      expect(tooltip.getAttribute('class')).toBe('hidden');
    })
  })
  
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
    
    
    it('should properly configure y axis', function() {
      var yAxis = elm.find('svg').children()[0].childNodes[1];
      
      var ticks = yAxis.childNodes;
      
      expect(ticks.length).toBe(12);
      
      expect(ticks[0].textContent).toBe('0');
      expect(ticks[10].textContent).toBe('50');
    });
    
    it('should properly configure x axis', function() {
      var xAxis = elm.find('svg').children()[0].childNodes[0];
      
      var ticks = xAxis.childNodes;
      
      expect(ticks.length).toBe(12);
      
      expect(ticks[0].textContent).toBe('0.0');
      expect(ticks[10].textContent).toBe('5.0');
    });
    
    it('should create a group', function() {
      var svgGroup = elm.find('svg').children()[0];
      
      var content = svgGroup.childNodes[2];
      expect(content.childNodes.length).toBe(2);
      
      var lineGroup = content.childNodes[0];
      expect(lineGroup.getAttribute('class')).toBe('lineGroup');
      expect(lineGroup.getAttribute('style')).toBe('stroke: #4682b4;');
      
      var dotsGroup = content.childNodes[1];
      expect(dotsGroup.nodeName).toBe('g');
      
      var dots = dotsGroup.childNodes;
      expect(dots.length).toBe(6);
      
      var expectedCoordinates = [
        {x: '0', y: '414'},
        {x: '160', y: '378'},
        {x: '320', y: '315'},
        {x: '480', y: '306'},
        {x: '640', y: '243'},
        {x: '800', y: '72'}
      ];
      for (var i = 0; i < dots.length; i++) {
        expect(dots[i].nodeName).toBe('circle');
        expect(dots[i].getAttribute('cx')).toBe(expectedCoordinates[i].x);
        expect(dots[i].getAttribute('cy')).toBe(expectedCoordinates[i].y);
      }
    });
    
    it('should draw a line', function() {
      var content = elm.find('svg').children()[0].childNodes[2];
      var lineGroup = content.childNodes[0];
      
      var linePath = lineGroup.childNodes[0];
      expect(linePath.getAttribute('class')).toBe('line');
      expect(linePath.getAttribute('d'))
        .toBe('M0,414L160,378L320,315L480,306L640,243L800,72');
    });
  })
})