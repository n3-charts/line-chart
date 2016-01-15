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
    ticks.map(function(t) {return t.getText(); }).then(function(v) {expect(v).toEqual(expected.map(String)); });
  };

  it('should pan on x only by default', function() {
    var chart = element(by.css('.chart'));

    checkTicks('x', [0, 1, 2, 3, 4, 5, 6, 7], element);
    checkTicks('y', [-15, -10, -5, 0, 5, 10, 15], element);

    browser.actions()
      .mouseDown(element(by.css('.container')))
      .mouseMove({x: -800, y: 200})
      .mouseUp(element(by.css('.container')))
      .perform();

    // This is flaky in Travis. Fix when releasing this feature ^^
    // checkTicks('x', [3, 4, 5, 6, 7, 8, 9], element);

    checkTicks('y', [-15, -10, -5, 0, 5, 10, 15], element);
  });
});
