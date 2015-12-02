/// <reference path='../test.e2e.ts' />

describe('Parametric data', function() {
  beforeEach(function() {
    browser.get('test/e2e/parametric.html');
  });

  it('should generate a chart', function() {
    var chart = element(by.css('.chart'));

    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');
  });

  // Tooltip should show as many lines as there are rows for a given coordinates set

  // There should be as many dots on the chart as there are of rows
});
