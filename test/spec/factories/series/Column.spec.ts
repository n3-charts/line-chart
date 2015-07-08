/// <reference path='../../test.spec.ts' />

describe('n3Charts.Factory.Series.Column', () => {
  var domElement: JQuery = angular.element(document.body).append('<div></div>');
  var columnSeries: n3Charts.Factory.Series.Column = undefined;

  beforeEach(() => {
    // Truncate the domElement
    domElement.children().remove();
    d3.select(domElement[0]).append('svg');

    columnSeries = new n3Charts.Factory.Series.Column();
  });

  describe('createSeriesContainer', () => {

    it('should provide a svg property', () => {

      var svgProp: SVGElement = undefined;
      var parentContainer = <SVGElement> domElement[0].getElementsByTagName('svg')[0];

      expect(columnSeries.svg).to.equal(undefined);

      columnSeries.createContainer(d3.select(parentContainer));

      svgProp = columnSeries.svg[0][0];

      expect(svgProp.getAttribute('class')).to.equal('line-data');
    });
  });
});
