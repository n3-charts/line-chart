/// <reference path='../test.e2e.ts' />

describe('Sync', function() {
  beforeEach(function() {
    browser.get('test/e2e/index.html');
  });

  var chart0;
  var chart1;

  beforeEach(function(){
    chart0 = element(by.css('.sync_0'));
    chart1 = element(by.css('.sync_1'));
  });

  it('should generate a chart', function() {
    expect(chart0.isPresent()).toBe(true);
    expect(chart1.isPresent()).toBe(true);
  });

  var checkTicks = function(axisSide) {
    var ticks0 = chart0.all(by.css('.chart .' + axisSide + '-axis .tick'));
    var ticks1 = chart1.all(by.css('.chart .' + axisSide + '-axis .tick'));

    expect(ticks0.count()).toBe(ticks1.count());

    ticks0.each(function(item, index) {
      item.getText().then(function(value0) {
        ticks1.get(index).getText().then(function(value1) {
          expect(value0).toEqual(value1);
        });
      });
    });
  };

  it('should pan on x only by default', function() {
    browser.executeScript('window.scrollTo(0,5414);');

    checkTicks('x');
    checkTicks('y');

    browser.actions()
      .mouseDown(element(by.css('.sync_0 .container')))
      .mouseMove({x: -510, y: 200})
      .mouseUp(element(by.css('.sync_0 .container')))
      .perform();

    checkTicks('x');
    checkTicks('y');

    // browser.wait(function() {
    //   console.log;
    // }, 1000000);
  });
});
