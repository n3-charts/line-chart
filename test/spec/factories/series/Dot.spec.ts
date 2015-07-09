/// <reference path='../../test.spec.ts' />

describe('n3Charts.Factory.Series.Dot', () => {
  var domElement: JQuery = angular.element(document.body).append('<div></div>');
  var dotSeries: n3Charts.Factory.Series.Dot = undefined;

  beforeEach(() => {
    // Truncate the domElement
    domElement.children().remove();
    d3.select(domElement[0]).append('svg');

    dotSeries = new n3Charts.Factory.Series.Dot();
  });

  describe('createSeriesContainer', () => {

    it('svg property should be a g node with proper class', () => {

      var svgProp: SVGElement = undefined;
      var parentContainer = <SVGElement> domElement[0].getElementsByTagName('svg')[0];

      expect(dotSeries.svg).to.equal(undefined);

      dotSeries.createContainer(d3.select(parentContainer));

      svgProp = dotSeries.svg[0][0];

      expect(svgProp.getAttribute('class')).to.equal(n3Charts.Factory.Series.Dot.type + '-data');
    });
  });
});
