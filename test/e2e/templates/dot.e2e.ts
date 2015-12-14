/// <reference path='../test.e2e.ts' />

describe('n3Charts.Factory.Series.Dot', function() {
  beforeEach(function() {
    browser.get('test/e2e/dot.html');
  });

  it('should generate a chart', function() {
    var chart = element(by.css('.chart'));

    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');
  });

  it('should have two dots with proper classes', function() {
    var dots = element.all(by.css('.chart .dot-series'));

    expect(dots.count()).toBe(2);
    expect(dots.get(0).getAttribute('class')).toBe('dot-series mySeries0');
    expect(dots.get(1).getAttribute('class')).toBe('dot-series mySeries1');
  });
});
