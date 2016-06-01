/// <reference path='../test.e2e.ts' />

describe('Custom ticks', function() {
  beforeEach(function() {
    browser.get('test/e2e/custom_ticks.html');
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

  it('should not have NaN as cx values...', function() {
    var dots = element.all(by.css('.dot'));
    expect(dots.get(0).getAttribute('cx')).not.toBe('NaN');
  });

  it('should generate a tooltip', function() {
    var chart = element(by.css('.chart'));
    var tooltip = element(by.css('.chart-tooltip'));

    expect(tooltip.isDisplayed()).toBeFalsy();

    browser.actions().mouseMove(chart as any).perform();

    expect(tooltip.isDisplayed()).toBeTruthy();
  });
});
