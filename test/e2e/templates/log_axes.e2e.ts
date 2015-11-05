/// <reference path='../test.e2e.ts' />

describe('Logarithmic axes', function() {
  beforeEach(function() {
    browser.get('test/e2e/log_axes.html');
  });

  it('should generate a chart', function() {
    var chart = element(by.css('.chart'));

    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');
  });

  it('should have four series with proper classes', function() {
    expect(element.all(by.css('.chart .data > *')).count()).toEqual(4);

    var lines = element.all(by.css('.chart .line-series'));
    expect(lines.count()).toBe(1);

    var areas = element.all(by.css('.chart .area-series'));
    expect(areas.count()).toBe(1);

    var dots = element.all(by.css('.chart .dot-series'));
    expect(dots.count()).toBe(1);
  });
});
