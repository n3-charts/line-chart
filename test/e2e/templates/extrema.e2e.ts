/// <reference path='../test.e2e.ts' />

describe('n3Charts.Factory.Axis extrema', function() {
  beforeEach(function() {
    browser.get('test/e2e/templates/extrema.html');
  });

  it('should generate a chart', function() {
    var chart = element(by.css('.chart'));

    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');
  });

  it('should use min and max', function() {
    var items = element.all(by.css('.chart .x-axis .tick text'));

    expect(items.count()).toBe(10);

    var expectedTicks = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8].map(String);

    items.each(function(item, index) {
      item.getText().then(function(text) {
        expect(text).toEqual(expectedTicks[index]);
      });
    });
  });
});
