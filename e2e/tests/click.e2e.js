"use strict";
describe('Click events', function () {
  beforeEach(function () {
    browser.get('click.html');
    // TODO : find a way to factorize this
    browser.executeScript('return window.angular !== undefined').then(function (hasIt) {
      if (!hasIt) {
        browser.sleep(250);
      }
    });
  });
  it('should trigger a callback when clicking on a dot', function () {
    browser.actions()
      .mouseMove(element.all(by.css('.dot')).get(3))
      .click()
      .perform();
    expect(element(by.css('.last-data')).getText()).toEqual('{"x":3,"y1":14.608,"y0":0,"raw":{"x":3,"val_0":2.823,"val_1":9.32,"val_2":14.608,"val_3":13.509}}');
  });
});
