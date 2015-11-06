/// <reference path='../test.e2e.ts' />

describe('ticks shift in options', function() {
  beforeEach(function() {
    browser.get('test/e2e/tick_shift.html');
  });

  it('should generate a chart', function() {
    var chart = element(by.css('.chart'));

    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');
  });

  it('should have shifted ticks', function() {
    expect(element.all(by.css('.chart .y-axis .tick text')).count()).toEqual(9);

    element.all(by.css('.chart .y-axis .tick text')).each(function(text) {
      text.getAttribute('transform').then(function(transform) {
        expect(transform).toEqual('translate(10, -5)');
      });
    });
  });
});
