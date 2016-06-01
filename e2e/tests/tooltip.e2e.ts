/// <reference path='../test.e2e.ts' />

describe('Tooltip', function() {
  beforeEach(function() {
    browser.get('test/e2e/tooltip.html');
  });

  it('should generate a chart', function() {
    var chart = element(by.css('.chart'));

    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');

    var tooltip = element(by.css('.chart-tooltip'));
    expect(tooltip.isPresent()).toBe(true);
  });

  it('should generate a tooltip', function() {
    var chart = element(by.css('.chart'));
    var tooltip = element(by.css('.chart-tooltip'));

    expect(tooltip.isDisplayed()).toBeFalsy();

    browser.actions().mouseMove(chart as any).perform();

    expect(tooltip.isDisplayed()).toBeTruthy();
  });
});
