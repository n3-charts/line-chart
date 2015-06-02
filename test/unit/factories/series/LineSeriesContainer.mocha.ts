/// <reference path='../../test.mocha.ts' />

describe('n3Charts.Factory.Series.LineSeriesContainer', () => {
  var domElement: JQuery = angular.element(document.body).append('<div></div>');
  var container: n3Charts.Factory.Series.LineSeriesContainer = undefined;

  beforeEach(() => {
    // Truncate the domElement
    domElement.children().remove();

    container = new n3Charts.Factory.Series.LineSeriesContainer();
  });

  describe('constructor()', () => {

    it('should return an instance', () => {

      container = new n3Charts.Factory.Series.LineSeriesContainer();

      expect(container).to.be.a(n3Charts.Factory.Series.LineSeriesContainer);
    });

  });
});
