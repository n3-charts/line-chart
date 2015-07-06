/// <reference path='../../test.spec.ts' />

describe('n3Charts.Factory.Series.Line', () => {
  var domElement: JQuery = angular.element(document.body).append('<div></div>');
  var lineSeries: n3Charts.Factory.Series.Line = undefined;

  beforeEach(() => {
    // Truncate the domElement
    domElement.children().remove();
    d3.select(domElement[0]).append('svg');

    lineSeries = new n3Charts.Factory.Series.Line();
  });

  describe('constructor()', () => {

    it('should return an instance', () => {

      lineSeries = new n3Charts.Factory.Series.Line();

      expect(lineSeries).to.be.a(n3Charts.Factory.Series.Line);
    });

  });

  describe('createContainer()', () => {

    it('should create a vis container', () => {

      var dataContainer: SVGElement = undefined;
      var parentContainer = <SVGElement> domElement[0].getElementsByTagName('svg')[0];

      lineSeries.createContainer(d3.select(parentContainer));

      dataContainer = <SVGElement> domElement[0].getElementsByTagName('g')[0];

      expect(dataContainer.getAttribute('class')).to.equal('line-data');
    });

    it('should provide a svg property', () => {

      var svgProp: SVGElement = undefined;
      var parentContainer = <SVGElement> domElement[0].getElementsByTagName('svg')[0];

      expect(lineSeries.svg).to.equal(undefined);

      lineSeries.createContainer(d3.select(parentContainer));

      svgProp = lineSeries.svg[0][0];

      expect(svgProp.getAttribute('class')).to.equal('line-data');
    });
  });
});
