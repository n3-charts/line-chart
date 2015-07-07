/// <reference path='../test.e2e.ts' />

describe('Dot series', function() {
  beforeEach(function() {
    browser.get('test/e2e/templates/dot.html');
  });

  it('should generate a graph', function() {
    expect(element(by.css('.chart')).isPresent()).toBe(true);
  });

  it('should have two dots with proper colors', function() {
    var lines = element.all(by.css('.chart .dot-series'));
    expect(lines.count()).toBe(2);

    expect(lines.get(0).getAttribute('class')).toBe('dot-series mySeries0');
    expect(lines.get(1).getAttribute('class')).toBe('dot-series mySeries1');
  });

});
