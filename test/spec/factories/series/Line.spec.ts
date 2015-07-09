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

  describe('createSeriesContainer', () => {

    it('svg property should be a g node with proper class', () => {

      var svgProp: SVGElement = undefined;
      var parentContainer = <SVGElement> domElement[0].getElementsByTagName('svg')[0];

      expect(lineSeries.svg).to.equal(undefined);

      lineSeries.createContainer(d3.select(parentContainer));

      svgProp = lineSeries.svg[0][0];

      expect(svgProp.getAttribute('class')).to.equal(n3Charts.Factory.Series.Line.type + '-data');
    });
  });
});
