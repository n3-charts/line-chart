"use strict";
describe('extrema', function () {

  var checkTicks = function (axisSide, expected, element) {
    var ticks = element.all(by.css('.chart .' + axisSide + '-axis .tick'));
    expect(ticks.count()).toBe(expected.length);
    ticks.map(function (t) {
      return t.getText();
    }).then(function (v) {
      expect(v).toEqual(expected.map(String));
    });
  };

  beforeEach(function () {
    browser.get('extrema.html');
  });

  it('should generate a chart', function () {
    var chart = element(by.css('.chart'));
    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');
  });

  it('should have axes and a grid', function () {
    expect(element(by.css('.grid')).isPresent()).toBe(true);
    expect(element(by.css('.x-axis')).isPresent()).toBe(true);
    expect(element(by.css('.y-axis')).isPresent()).toBe(true);
  });

  it('should use min and max', function () {
    checkTicks('y', [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8], element);
  });

  it('should have correct abscissas despite the extra dataset', function () {
    checkTicks('x', ['0.0', '0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0'], element);
  });

});
