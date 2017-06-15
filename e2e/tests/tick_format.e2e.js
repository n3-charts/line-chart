"use strict";
describe('n3Charts.Utils.AxisOptions.tickFormat', function () {
  beforeEach(function () {
    browser.get('tick_format.html');
  });
  it('should have formatted x ticks', function () {
    var ticks = element.all(by.css('.chart .x-axis .tick'));
    expect(ticks.count()).toBe(15);
    ticks.get(0).getText().then(function (value) {
      expect(value).toBe('Pouet : 0 0');
    });
  });
  it('should have formatted y ticks', function () {
    var ticks = element.all(by.css('.chart .y-axis .tick'));
    expect(ticks.count()).toBe(11);
    ticks.get(1).getText().then(function (value) {
      expect(value).toBe('Tut : 100 1');
    });
  });
});
