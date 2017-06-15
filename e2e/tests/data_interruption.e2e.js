"use strict";
describe('Data interruption', function () {
  beforeEach(function () {
    browser.get('data_interruption.html');
  });
  it('should generate a chart', function () {
    var chart = element(by.css('.chart'));
    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');
    var tooltip = element(by.css('.chart-tooltip'));
    expect(tooltip.isPresent()).toBe(true);
  });
});
