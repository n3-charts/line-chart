/// <reference path='../test.e2e.ts' />

describe('grid', function() {
  beforeEach(function() {
    browser.get('test/e2e/grid.html');

    // TODO : find a way to factorize this
    // Needed for click actions or the like on non-angular pages.
    browser.executeScript('return window.angular !== undefined').then(function(hasIt) {
      if (!hasIt) {
        browser.sleep(250);
      }
    });
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

  it ('should work for y grid', () => {
    var yGrid = element(by.css('.y-grid'));
    expect(yGrid.isPresent()).toBe(true);
    expect(yGrid.getAttribute('style')).toContain('display: none');

    element(by.id('yGrid')).click();
    expect(yGrid.isPresent()).toBe(true);
    expect(yGrid.getAttribute('style')).not.toContain('display: none');
  });

  it ('should work for x grid', () => {
    var xGrid = element(by.css('.x-grid'));
    expect(xGrid.isPresent()).toBe(true);
    expect(xGrid.getAttribute('style')).toContain('display: none');

    element(by.id('xGrid')).click();
    expect(xGrid.isPresent()).toBe(true);
    expect(xGrid.getAttribute('style')).not.toContain('display: none');
  });
});
