/// <reference path='../test.spec.ts' />

describe('n3Charts.Utils.SeriesFactory', () => {
  var domElement: JQuery = angular.element(document.body).append('<div></div>');
  var seriesFactory: n3Charts.Utils.SeriesFactory = undefined;

  beforeEach(() => {
    // Truncate the domElement
    domElement.children().remove();
    d3.select(domElement[0]).append('svg');

    seriesFactory = new n3Charts.Utils.SeriesFactory();
  });

  describe('createContainer()', () => {

    it('should create a svg container', () => {

      var dataContainer: SVGElement = undefined;
      var parentContainer = <SVGElement> domElement[0].getElementsByTagName('svg')[0];

      seriesFactory.createContainer(d3.select(parentContainer));
      dataContainer = <SVGElement> domElement[0].getElementsByTagName('g')[0];

      expect(dataContainer).not.to.equal(undefined);
      expect(dataContainer.tagName).to.equal('g');
    });

    it('should provide a svg property', () => {

      var parentContainer = <SVGElement> domElement[0].getElementsByTagName('svg')[0];
      var svgProp: SVGElement = undefined;

      expect(seriesFactory.svg).to.equal(undefined);

      seriesFactory.createContainer(d3.select(parentContainer));

      expect(seriesFactory.svg).to.not.equal(undefined);
      expect(seriesFactory.svg[0][0].tagName).to.equal('g');
    });
  });
});
