/// <reference path='../test.e2e.ts' />

describe('Click events', function() {
  beforeEach(function() {
    browser.get('test/e2e/click.html');

    // TODO : find a way to factorize this
    browser.executeScript('return window.angular !== undefined').then(function(hasIt) {
      if (!hasIt) {
        browser.sleep(250);
      }
    });
  });

  it('should trigger a callback when clicking on a dot', function() {
    browser.actions()
      .mouseMove(element.all(by.css('.dot')).get(3) as any)
      .click()
      .perform();

    expect(element(by.css('.last-data')).getText()).toEqual('{"x":3,"y1":14.608,"y0":0}');
  });
});
