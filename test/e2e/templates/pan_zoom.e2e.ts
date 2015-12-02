/// <reference path='../test.e2e.ts' />

describe('Pan & zoom', function() {
  beforeEach(function() {
    browser.get('test/e2e/pan_zoom.html');
  });

  it('should generate a chart', function() {
    var chart = element(by.css('.chart'));

    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');
  });

  var checkTicks = function(axisSide, expected, element) {
    var ticks = element.all(by.css('.chart .' + axisSide + '-axis .tick'));
    expect(ticks.count()).toBe(expected.length);

    var expectedTicks = expected.map(String);

    ticks.each(function(item, index) {
      item.getText().then(function(text) {
        expect(text).toEqual(expectedTicks[index]);
      });
    });
  };

  it('should pan on x only by default', function() {
    var chart = element(by.css('.chart'));

    checkTicks('x', [0, 1, 2, 3, 4, 5, 6, 7], element);
    checkTicks('y', [-15, -10, -5, 0, 5, 10, 15], element);

    browser.actions()
      .mouseDown(element(by.css('.container')))
      .mouseMove({x: -500, y: 200})
      .mouseUp(element(by.css('.container')))
      .perform();

    checkTicks('x', [3, 4, 5, 6, 7, 8, 9], element);
    checkTicks('y', [-15, -10, -5, 0, 5, 10, 15], element);
  });
});
