"use strict";
describe('Ticks', function () {
  beforeEach(function () {
    browser.get('ticks.html');
  });
  it('should have proper x ticks', function () {
    var ticks = element.all(by.css('.chart .x-axis .tick'));
    expect(ticks.count()).toBe(3);
    ['-10', '0', '10'].forEach(function (v, i) {
      ticks.get(i).getText().then(function (value) {
        expect(value).toBe(v);
      });
    });
  });
  it('should have proper y ticks', function () {
    var ticks = element.all(by.css('.chart .y-axis .tick'));
    expect(ticks.count()).toBe(5);
    ['0', '1', '2', '3', '4'].forEach(function (v, i) {
      ticks.get(i).getText().then(function (value) {
        expect(value).toBe('' + v);
      });
    });
  });
});
