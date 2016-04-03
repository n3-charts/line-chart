/// <reference path='../test.e2e.ts' />

describe('n3Charts.Factory.Series.Column', function() {
  beforeEach(function() {
    browser.get('test/e2e/column.html');
  });

  it('should generate a chart', function() {
    var chart = element(by.css('.chart'));

    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');
  });

  it('should have two columns with proper classes', function() {
    var cols = element.all(by.css('.chart .column-series'));

    expect(cols.count()).toBe(3);
    expect(cols.get(0).getAttribute('class')).toBe('column-series mySeries0');
    expect(cols.get(1).getAttribute('class')).toBe('column-series mySeries1');
    expect(cols.get(2).getAttribute('class')).toBe('column-series mySeries2');
  });
});
