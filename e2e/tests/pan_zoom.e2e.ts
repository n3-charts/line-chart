/// <reference path='../test.e2e.ts' />

// This test depends SO MUCH on the display it's ran on...

describe('Pan & zoom', function() {
  beforeEach(function() {
    // TODO : find a way to factorize this
    browser.executeScript('return window.angular !== undefined').then(function(hasIt) {
      if (!hasIt) {
        browser.sleep(250);
      }
    });
  });


  beforeEach(function() {
    browser.get('test/e2e/pan_zoom.html');
  });

  var hasClass = function(element, cls) {
    return element.getAttribute('class').then(function(classes) {
      return classes.split(' ').indexOf(cls) !== -1;
    });
  };

  var checkTicks = function(axisSide, expected, element) {
    var ticks = element.all(by.css('.chart .' + axisSide + '-axis .tick'));
    expect(ticks.count()).toBe(expected.length);

    ticks.map(function(t) {
      return t.getText();
    }).then(function(v) {
      expect(v).toEqual(expected.map(String));
    });
  };

  it('should set a class to the element when panning', function() {
    var container = element(by.css('.chart')).getWebElement();

    expect(hasClass(container, 'panning')).toEqual(false);

    browser.actions()
      .mouseMove(container, {x: 20, y: 20})
      .mouseDown()
      .mouseMove(container, {x: 100, y: 50})
      .perform();


    expect(hasClass(container, 'panning')).toEqual(true);

    browser.actions()
      .mouseUp()
      .perform();

    expect(hasClass(container, 'panning')).toEqual(false);
  });


  it('should constrain panning when told to', function() {
    var container = element(by.css('.container')).getWebElement();
    element(by.id('constrainCheckbox')).click();

    checkTicks('x', [0, 2, 4, 6], element);
    checkTicks('y', [-15, -10, -5, 0, 5, 10, 15], element);

    // Okay so for some reason, this will only pan the chart if
    // there are three mouse actions sequences...
    // If anyone wants to improve this, that'll be much appreciated.
    browser.actions()
      .mouseMove(container, {x: 20, y: 20})
      .mouseDown()
      .mouseMove(container, {x: 100, y: 50})
      .mouseUp()
      .perform();

    browser.actions()
      .mouseMove(container, {x: 20, y: 20})
      .mouseDown()
      .mouseMove(container, {x: 100, y: 50})
      .mouseUp()
      .perform();

    browser.actions()
      .mouseMove(container, {x: 20, y: 20})
      .mouseDown()
      .mouseMove(container, {x: 100, y: 50})
      .mouseUp()
      .perform();

    checkTicks('x', [0, 2, 4, 6], element);
    checkTicks('y', [-5, 0, 5, 10, 15, 20, 25, 30], element);

    // d3 doesn't handle double clicks...
    browser.actions().click().click().perform();
    browser.sleep(500);

    checkTicks('x', [0, 2, 4, 6], element);
    checkTicks('y', [-15, -10, -5, 0, 5, 10, 15], element);
  });

  it('should ignore double click when told to', function() {
    var container = element(by.css('.container')).getWebElement();
    element(by.id('doubleClickCheckbox')).click();

    checkTicks('x', [0, 2, 4, 6], element);
    checkTicks('y', [-15, -10, -5, 0, 5, 10, 15], element);

    // Okay so for some reason, this will only pan the chart if
    // there are three mouse actions sequences...
    // If anyone wants to improve this, that'll be much appreciated.
    browser.actions()
      .mouseMove(container, {x: 20, y: 20})
      .mouseDown()
      .mouseMove(container, {x: 100, y: 50})
      .mouseUp()
      .perform();

    browser.actions()
      .mouseMove(container, {x: 20, y: 20})
      .mouseDown()
      .mouseMove(container, {x: 100, y: 50})
      .mouseUp()
      .perform();

    browser.actions()
      .mouseMove(container, {x: 20, y: 20})
      .mouseDown()
      .mouseMove(container, {x: 100, y: 50})
      .mouseUp()
      .perform();

    checkTicks('x', [-2, 0, 2], element);
    checkTicks('y', [-5, 0, 5, 10, 15, 20, 25, 30], element);

    // d3 doesn't handle double clicks...
    browser.actions().click().click().perform();
    browser.sleep(500);

    checkTicks('x', [-2, 0, 2], element);
    checkTicks('y', [-5, 0, 5, 10, 15, 20, 25, 30], element);
  });


  it('should pan on both axes', function() {
    var container = element(by.css('.container')).getWebElement();

    checkTicks('x', [0, 2, 4, 6], element);
    checkTicks('y', [-15, -10, -5, 0, 5, 10, 15], element);

    // Okay so for some reason, this will only pan the chart if
    // there are three mouse actions sequences...
    // If anyone wants to improve this, that'll be much appreciated.
    browser.actions()
      .mouseMove(container, {x: 20, y: 20})
      .mouseDown()
      .mouseMove(container, {x: 100, y: 50})
      .mouseUp()
      .perform();

    browser.actions()
      .mouseMove(container, {x: 20, y: 20})
      .mouseDown()
      .mouseMove(container, {x: 100, y: 50})
      .mouseUp()
      .perform();

    browser.actions()
      .mouseMove(container, {x: 20, y: 20})
      .mouseDown()
      .mouseMove(container, {x: 100, y: 50})
      .mouseUp()
      .perform();

    checkTicks('x', [-2, 0, 2], element);
    checkTicks('y', [-5, 0, 5, 10, 15, 20, 25, 30], element);

    // d3 doesn't handle double clicks...
    browser.actions().click().click().perform();
    browser.sleep(500);

    checkTicks('x', [0, 2, 4, 6], element);
    checkTicks('y', [-15, -10, -5, 0, 5, 10, 15], element);
  });

  it('should zoom on both axes', function() {
    var container = element(by.css('.container')).getWebElement();

    checkTicks('x', [0, 2, 4, 6], element);
    checkTicks('y', [-15, -10, -5, 0, 5, 10, 15], element);

    browser.actions()
      .mouseMove(container, {x: 20, y: 20})
      .keyDown(protractor.Key.ALT)
      .mouseDown()
      .keyUp(protractor.Key.ALT)
      .mouseMove(container, {x: 100, y: 50})
      .mouseUp()
      .perform();

    browser.sleep(500);

    checkTicks('x', ['0.0', '0.2', '0.4', '0.6', '0.8', '1.0'], element);
    checkTicks('y', ['12.5', '13.0', '13.5', '14.0', '14.5', '15.0', '15.5', '16.0', '16.5'], element);

    // d3 doesn't handle double clicks...
    browser.actions().click().click().perform();
    browser.sleep(500);

    checkTicks('x', [0, 2, 4, 6], element);
    checkTicks('y', [-15, -10, -5, 0, 5, 10, 15], element);
  });
});
