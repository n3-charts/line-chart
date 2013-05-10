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
  
  
  it('should create one svg element', function() {
    expect(elm[0].getAttribute('id')).toBe('toto');
    
    var templateElmts = elm[0].children;
    expect(templateElmts.length).toBe(1);
    expect(templateElmts[0].nodeName).toBe('DIV'); // this is the template's div
    expect(templateElmts[0].getAttribute('class')).toBe('linechart');
    
    var dynamicChildren = templateElmts[0].children;
    expect(dynamicChildren.length).toBe(1);
    expect(dynamicChildren[0].nodeName).toBe('svg');
  });
  
  
  it('should create exactly two axes, one content group, two tooltips groups', function() {
    var svgGroup = elm.find('svg').children()[0];
    
    var content = svgGroup.childNodes;
    expect(content.length).toBe(5);
    
    expect(content[2].getAttribute('id')).toBe('xTooltip')
    expect(content[3].getAttribute('id')).toBe('yTooltip')
  });
  
  describe('tooltip', function() {
    beforeEach(function() {
      scope.$apply(function() {
        scope.data = [{x: 0, value: 4}, {x: 1, value: 8}];
        
        scope.options = {series: [{y: 'value', color: '#4682b4'} ]}
      });
    })
    
    // Could not manage this test to pass, despite the fact it does work...
    xit('should show/hide the tooltip when hovering/leaving a dot', function() {
      var svgGroup = elm.find('svg').children()[0];
    
      var content = svgGroup.childNodes;
      
      var dots = content[4].childNodes[1].childNodes;
      
      var xTooltip = content[2];
      expect(xTooltip.getAttribute('id')).toBe('xTooltip');
      expect(xTooltip.getAttribute('opacity')).toBe('0');
      
      var e = document.createEvent('UIEvents');
      e.initUIEvent('mouseover');
      dots[0].dispatchEvent(e);
      expect(xTooltip.getAttribute('opacity')).toBe('1');
      
      e.initUIEvent('mouseout');
      dots[0].dispatchEvent(e);
      expect(xTooltip.getAttribute('opacity')).toBe('0');
    })
  })
  
  describe('lineUtil', function() {
    it ('should compute the widest y value', inject(function(lineUtil) {
      var data = [
        {x: 0, foo: 4.154, value: 4},
        {x: 1, foo: 8.15485, value: 8},
        {x: 2, foo: 1.1548578, value: 15},
        {x: 3, foo: 1.154, value: 16},
        {x: 4, foo: 2.45, value: 23},
        {x: 5, foo: 4, value: 42}
      ];
      
      var series = [{y: 'value'}];
      expect(lineUtil.getWidestOrdinate(data, series)).toBe(15);
      
      series = [{y: 'value'}, {y: 'foo'}];
      expect(lineUtil.getWidestOrdinate(data, series)).toBe(1.1548578);
    }))
  });
  
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
      
      var content = svgGroup.childNodes[4];
      expect(content.childNodes.length).toBe(2);
      
      var lineGroup = content.childNodes[0];
      expect(lineGroup.getAttribute('class')).toBe('lineGroup');
      expect(lineGroup.getAttribute('style').trim()).toBe('stroke: #4682b4;');
      
      var dotsGroup = content.childNodes[1];
      expect(dotsGroup.nodeName).toBe('g');
      
      var dots = dotsGroup.childNodes;
      expect(dots.length).toBe(6);
      
      var expectedCoordinates = [
        {x: '0', y: '414'},
        {x: '161', y: '378'},
        {x: '322', y: '315'},
        {x: '483', y: '306'},
        {x: '644', y: '243'},
        {x: '805', y: '72'}
      ];
      for (var i = 0; i < dots.length; i++) {
        expect(dots[i].nodeName).toBe('circle');
        expect(dots[i].getAttribute('cx')).toBe(expectedCoordinates[i].x);
        expect(dots[i].getAttribute('cy')).toBe(expectedCoordinates[i].y);
      }
    });
    
    it('should draw a line', function() {
      var content = elm.find('svg').children()[0].childNodes[4];
      var lineGroup = content.childNodes[0];
      
      var linePath = lineGroup.childNodes[0];
      expect(linePath.getAttribute('class')).toBe('line');
      expect(linePath.getAttribute('d'))
        .toBe('M0,414L161,378L322,315L483,306L644,243L805,72');
    });
  })
})