/// <reference path='../test.e2e.ts' />

describe('n3Charts.Factory.Legend', function() {
  beforeEach(function() {
    browser.get('test/e2e/legend.html');
  });

  it('should generate a chart', function() {
    var chart = element(by.css('.chart'));

    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');
  });

  it('should have legend items with proper classes', function() {
    var items = element.all(by.css('.chart-legend .item'));

    expect(items.count()).toBe(4);

    ['item area', 'item dot', 'item dot line', 'item column'].forEach(function(className, i) {
      expect(items.get(i).getAttribute('class')).toBe(className);
    });
  });

  it('should hide a series', function() {
    expect(element.all(by.css('.chart .area-series')).count()).toEqual(1);
    element(by.css('.chart-legend .item.area')).click();
    expect(element.all(by.css('.chart .area-series')).count()).toEqual(0);

    expect(element.all(by.css('.chart .column-series')).count()).toEqual(1);
    element(by.css('.chart-legend .item.column')).click();
    expect(element.all(by.css('.chart .column-series')).count()).toEqual(0);
  });

  it('should have legend item labels', function() {
    expect(element.all(by.css('.chart-legend .item .legend-label')).count()).toEqual(4);
  });

  it('should have legend item with proper class when hidden', function() {
    expect(element.all(by.css('.chart-legend .item.dot.legend-hidden')).count()).toEqual(0);
    element.all(by.css('.chart-legend .item.dot')).first().click();
    expect(element.all(by.css('.chart-legend .item.dot.legend-hidden')).count()).toEqual(1);
  });
});
