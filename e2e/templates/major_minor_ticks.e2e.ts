/// <reference path='../test.e2e.ts' />

describe('Date Abscissas', function() {
  beforeEach(function() {
    browser.get('test/e2e/major_minor_ticks.html');
  });

  it('should generate a chart', function() {
    var chart = element(by.css('.chart'));

    expect(chart.isPresent()).toBe(true);
    expect(chart.getTagName()).toBe('svg');
  });

  var checkTicks = function(axisSide, ticks, element) {
    var majorTicks = element.all(by.css('.chart .' + axisSide + '-axis .tick.major'));
    expect(majorTicks.count()).toBe(ticks.major.length);

    majorTicks.map(function(t) {
      return t.getText();
    }).then(function(v) {
      expect(v).toEqual(ticks.major);
    });

    var minorTicks = element.all(by.css('.chart .' + axisSide + '-axis .tick.minor'));
    expect(minorTicks.count()).toBe(ticks.minor.length);

    minorTicks.map(function(t) {
      return t.getText();
    }).then(function(v) {
      expect(v).toEqual(ticks.minor);
    });
  };

  it('should have major and minor ticks', function() {
    var container = element(by.css('.container'));

    checkTicks('x', {
      major: ['21h', '22h', '23h'],
      minor: [':30', ':45', ':00', ':15', ':30', ':45', ':00', ':15', ':30', ':45', ':00', ':15']
    }, element);

    checkTicks('y', {
      major: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      minor: ['0.5', '0.5', '0.5', '0.5', '0.5', '0.5', '0.5', '0.5', '0.5', '0.5']
    }, element);

    browser.actions()
      .mouseMove(container, {x: 20, y: 20})
      .keyDown(protractor.Key.ALT)
      .mouseDown()
      .keyUp(protractor.Key.ALT)
      .mouseMove(container, {x: 100, y: 50})
      .mouseUp()
      .perform();

    browser.sleep(500);

    checkTicks('x', {
      major: [],
      minor: [':15', ':30']
    }, element);

    checkTicks('y', {
      major: ['8', '9'],
      minor: ['0.2', '0.4', '0.6', '0.8', '0.2']
    }, element);
  });
});
