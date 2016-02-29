/// <reference path='../test.e2e.ts' />

describe('Click events', function() {
  beforeEach(function() {
    browser.get('test/e2e/click.html');
  });

  it('should trigger a callback when clicking on a dot', function() {
    browser.actions()
      .mouseMove(element.all(by.css('.dot')).get(3))
      .click()
      .perform();

    expect(element(by.css('.last-data')).getText()).toEqual('{"x":3,"y1":14.608,"y0":0}');
  });
});
