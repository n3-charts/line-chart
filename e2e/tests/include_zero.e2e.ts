/// <reference path='../test.e2e.ts' />

'use strict';

describe('Include zero in axis options', function() {
  beforeEach(function() {
    browser.get('test/e2e/include_zero.html');
  });

  it('should generate a chart', function() {
    var chart = element(by.css('.chart'));

    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');
  });

  var checkTicks = function(axisSide, expected, element) {
    var ticks = element.all(by.css('.chart .' + axisSide + '-axis .tick'));

    expect(ticks.count()).toBe(expected.length);
    ticks.map(function(t) {
      return t.getText();
    }).then(function(v) {
      expect(v).toEqual(expected.map(String));
    });
  };

  describe('for positive series', function() {
    it('should work on the y axis', function() {
      checkTicks('y', [0, 10, 20, 30, 40, 50], element);
      checkTicks('y2', [0, 10, 20, 30, 40, 50], element);
    });
  });

  describe('for negative series', function() {
    beforeEach(function() {
      var legendItems = element.all(by.css('.chart-legend .item.line'));
      legendItems.get(0).click();
      legendItems.get(1).click();
      browser.sleep(300);
    });

    it('should work on the y axis', function() {
      checkTicks('y', [-50, -40, -30, -20, -10, 0], element);
      checkTicks('y2', [-50, -40, -30, -20, -10, 0], element);
    });
  });

  describe('for no visible series', function() {
    beforeEach(function() {
      var legendItems = element.all(by.css('.chart-legend .item.line'));
      legendItems.get(0).click();
      browser.sleep(300);
    });

    it('should work on the y axis', function() {
      checkTicks('y', ['0.0', '0.2', '0.4', '0.6', '0.8', '1.0'], element);
      checkTicks('y2', ['0.0', '0.2', '0.4', '0.6', '0.8', '1.0'], element);
    });
  });
});
