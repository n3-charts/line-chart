/// <reference path='../../test.spec.ts' />

describe('n3Charts.Factory.Series.Area', () => {
  var domElement: JQuery = angular.element(document.body).append('<div></div>');
  var areaSeries: n3Charts.Factory.Series.Area = undefined;

  beforeEach(() => {
    // Truncate the domElement
    domElement.children().remove();
    d3.select(domElement[0]).append('svg');

    areaSeries = new n3Charts.Factory.Series.Area();
  });

  describe('createSeriesContainer', () => {

    it('svg property should be a g node with proper class', () => {

      var svgProp: SVGElement = undefined;
      var parentContainer = <SVGElement> domElement[0].getElementsByTagName('svg')[0];

      expect(areaSeries.svg).to.equal(undefined);

      areaSeries.createContainer(d3.select(parentContainer));

      svgProp = areaSeries.svg[0][0];

      expect(svgProp.getAttribute('class')).to.equal(n3Charts.Factory.Series.Area.type + '-data');
    });
  });
});
