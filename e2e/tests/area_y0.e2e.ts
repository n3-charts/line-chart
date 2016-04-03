/// <reference path='../test.e2e.ts' />

describe('n3Charts.Factory.Series.Area - y0', function() {
  beforeEach(function() {
    browser.get('test/e2e/area_y0.html');
  });

  it('should generate a chart', function() {
    var chart = element(by.css('.chart'));

    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');
  });

  it('should have two series with proper classes', function() {
    var lines = element.all(by.css('.chart .line-series'));
    expect(lines.count()).toBe(1);
    expect(lines.get(0).getAttribute('class')).toBe('line-series mySeries0');

    var areas = element.all(by.css('.chart .area-series'));
    expect(areas.count()).toBe(1);
    expect(areas.get(0).getAttribute('class')).toBe('area-series mySeries1');
  });

  it('should have ticks', function() {
    var items = element.all(by.css('.chart .y-axis .tick text'));

    items.get(0).getText().then(function(text) {
      expect(text).toEqual('90');
    });

    items.get(-1).getText().then(function(text) {
      expect(text).toEqual('130');
    });
  });
});
