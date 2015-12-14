/// <reference path='../test.e2e.ts' />

describe('n3Charts.Factory.Series.Area', function() {
  beforeEach(function() {
    browser.get('test/e2e/area.html');
  });

  it('should generate a chart', function() {
    var chart = element(by.css('.chart'));

    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');
  });

  it('should have two areas with proper classes', function() {
    var areas = element.all(by.css('.chart .area-series'));

    expect(areas.count()).toBe(2);
    expect(areas.get(0).getAttribute('class')).toBe('area-series mySeries0');
    expect(areas.get(1).getAttribute('class')).toBe('area-series mySeries1');
  });
});
