/// <reference path='../test.e2e.ts' />

describe('Two axes', function() {
  beforeEach(function() {
    browser.get('test/e2e/two_axes.html');
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

  it('should pan on both axes', function() {
    var container = element(by.css('.container')).getWebElement();

    checkTicks('x', [ '0', '1', '2', '3', '4', '5', '6', '7' ], element);
    checkTicks('y', [ '-12', '-10', '-8', '-6', '-4', '-2', '0', '2', '4', '6', '8', '10', '12', '14' ], element);
    checkTicks('y2', [ '-10', '0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100' ], element);

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

    checkTicks('x', [ '-3', '-2', '-1', '0', '1', '2', '3' ], element);
    checkTicks('y', [ '-2', '0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22', '24' ], element);
    checkTicks('y2', [ '30', '40', '50', '60', '70', '80', '90', '100', '110', '120', '130' ], element);

    // d3 doesn't handle double clicks...
    browser.actions().click().click().perform();
    browser.sleep(500);

    checkTicks('x', [ '0', '1', '2', '3', '4', '5', '6', '7' ], element);
    checkTicks('y', [ '-12', '-10', '-8', '-6', '-4', '-2', '0', '2', '4', '6', '8', '10', '12', '14' ], element);
    checkTicks('y2', [ '-10', '0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100' ], element);
  });

  it('should zoom on both axes', function() {
    var container = element(by.css('.container')).getWebElement();

    checkTicks('x', [ '0', '1', '2', '3', '4', '5', '6', '7' ], element);
    checkTicks('y', [ '-12', '-10', '-8', '-6', '-4', '-2', '0', '2', '4', '6', '8', '10', '12', '14' ], element);
    checkTicks('y2', [ '-10', '0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100' ], element);

    browser.actions()
      .mouseMove(container, {x: 20, y: 20})
      .keyDown(protractor.Key.ALT)
      .mouseDown()
      .keyUp(protractor.Key.ALT)
      .mouseMove(container, {x: 100, y: 55})
      .mouseUp()
      .perform();

    browser.sleep(500);

    checkTicks('x', [ '0.0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0' ], element);
    checkTicks('y', [ '9.5', '10.0', '10.5', '11.0', '11.5', '12.0', '12.5', '13.0' ], element);
    checkTicks('y2', [ '80', '82', '84', '86', '88', '90', '92', '94' ], element);

    // d3 doesn't handle double clicks...
    browser.actions().click().click().perform();
    browser.sleep(500);

    checkTicks('x', [ '0', '1', '2', '3', '4', '5', '6', '7' ], element);
    checkTicks('y', [ '-12', '-10', '-8', '-6', '-4', '-2', '0', '2', '4', '6', '8', '10', '12', '14' ], element);
    checkTicks('y2', [ '-10', '0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '100' ], element);
  });
});
