/// <reference path='../test.e2e.ts' />

describe('n3Charts.Factory.Series.Line', function() {
  beforeEach(function() {
    browser.get('test/e2e/line.html');
  });

  it('should generate a chart', function() {
    var chart = element(by.css('.chart'));

    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');
  });

  it('should have two lines with proper classes', function() {
    var lines = element.all(by.css('.chart .line-series'));

    expect(lines.count()).toBe(2);
    expect(lines.get(0).getAttribute('class')).toBe('line-series mySeries0');
    expect(lines.get(1).getAttribute('class')).toBe('line-series mySeries1 dashed');
  });

  it('should have legend items with proper classes', function() {
    var items = element.all(by.css('.chart-legend .item'));

    expect(items.count()).toBe(2);

    ['item line', 'item dashed-line'].forEach(function(className, i) {
      expect(items.get(i).getAttribute('class')).toBe(className);
    });
  });
});
