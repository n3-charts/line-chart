/// <reference path='../test.e2e.ts' />

describe('n3Charts.Options.DotOptions', function() {
  beforeEach(function() {
    browser.get('test/e2e/dot_options.html');
  });

  it('should generate a chart', function() {
    var chart = element(by.css('.chart'));

    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');
  });

  it('should show series dots with the correct radius', function() {
    var dot = element.all(by.css('.chart .dot-series .dot')).get(0).getWebElement();
    expect(dot.getAttribute('r')).toEqual('4');
  });

  it('should show the tooltip dot with the correct radius', function() {
    var chart = element(by.css('.chart'));
    browser.actions().mouseMove(chart).perform();
    var dot = element.all(by.css('.chart .tooltip-dot')).get(0).getWebElement();
    dot.getAttribute('d').then(function(text) {
      var radius = text.match(/^M (.*) m -(\d),/)[2];
      expect(radius).toEqual('6');
    });
  });
});
