/// <reference path='../../test.spec.ts' />

describe('n3Charts.Factory.Series.SeriesFactory', () => {
  var domElement: JQuery = angular.element(document.body).append('<div></div>');
  var seriesFactory: n3Charts.Factory.Series.SeriesFactory = undefined;

  beforeEach(() => {
    // Truncate the domElement
    domElement.children().remove();
    d3.select(domElement[0]).append('svg');

    seriesFactory = new n3Charts.Factory.Series.SeriesFactory();
  });

  describe('createContainer()', () => {

    it('should create a svg container', () => {

      var dataContainer: SVGElement = undefined;
      var parentContainer = <SVGElement> domElement[0].getElementsByTagName('svg')[0];

      seriesFactory.createContainer(d3.select(parentContainer));
      dataContainer = <SVGElement> domElement[0].getElementsByTagName('g')[0];

      expect(dataContainer).not.toBe(undefined);
      expect(dataContainer.tagName).toBe('g');
    });

    it('should provide a svg property', () => {

      var parentContainer = <SVGElement> domElement[0].getElementsByTagName('svg')[0];
      var svgProp: SVGElement = undefined;

      expect(seriesFactory.svg).toBe(undefined);

      seriesFactory.createContainer(d3.select(parentContainer));

      expect(seriesFactory.svg).not.toEqual(undefined);
      expect((<SVGElement>seriesFactory.svg[0][0]).tagName).toBe('g');
    });
  });
});
