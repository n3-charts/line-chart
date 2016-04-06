/// <reference path='../test.e2e.ts' />

describe('symbols', function() {
  beforeEach(function() {
    browser.get('test/e2e/symbols.html');
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

  it('should generate a chart', function() {
    var chart = element(by.css('.chart'));

    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');
  });
});
