"use strict";
describe('n3Charts.Factory.Series.condColor', function () {
  beforeEach(function () {
    browser.get('cond_color.html');
  });
  it('should generate a chart', function () {
    var chart = element(by.css('.chart'));
    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');
  });
});
