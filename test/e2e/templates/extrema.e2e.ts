/// <reference path='../test.e2e.ts' />

describe('n3Charts.Factory.Axis extrema', function() {
  beforeEach(function() {
    browser.get('test/e2e/extrema.html');
  });

  it('should generate a chart', function() {
    var chart = element(by.css('.chart'));

    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');
  });

  it('should have axes and a grid', function() {
    expect(element(by.css('.grid')).isPresent()).toBe(true);
    expect(element(by.css('.x-axis')).isPresent()).toBe(true);
    expect(element(by.css('.y-axis')).isPresent()).toBe(true);
  });

  it('should use min and max', function() {
    var yTicks = element.all(by.css('.chart .y-axis .tick text'));

    expect(yTicks.count()).toBe(10);

    var expectedTicks = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8].map(String);

    yTicks.each(function(item, index) {
      item.getText().then(function(text) {
        expect(text).toEqual(expectedTicks[index]);
      });
    });
  });

  it('should have correct abscissas despite the extra dataset', function() {
    var xTicks = element.all(by.css('.chart .x-axis .tick text'));

    expect(xTicks.count()).toBe(8);

    var expectedTicks = [0, 1, 2, 3, 4, 5, 6, 7].map(String);

    xTicks.each(function(item, index) {
      item.getText().then(function(text) {
        expect(text).toEqual(expectedTicks[index]);
      });
    });
  });
});
