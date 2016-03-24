/// <reference path='../../test.spec.ts' />

describe('n3Charts.Factory.Series.Dot', () => {
  var domElement: JQuery = angular.element(document.body).append('<div></div>');
  var dotSeries: n3Charts.Factory.Series.Dot;

  beforeEach(() => {
    // Truncate the domElement
    domElement.children().remove();
    d3.select(domElement[0]).append('svg');

    dotSeries = new n3Charts.Factory.Series.Dot();
  });

  describe('createSeriesContainer', () => {
    var container: SVGElement;

    beforeEach(() => {
      container = <SVGElement> domElement[0].getElementsByTagName('svg')[0];
      dotSeries.createContainer(d3.select(container));
    });

    it('should create a <g> container', () => {
      var testing = (<SVGElement>dotSeries.svg[0][0]).tagName;
      var expected = 'g';

      expect(testing).toBe(expected);
    });

    it('should define a proper class', () => {
        var containerSuffix = n3Charts.Factory.Series.SeriesFactory.containerClassSuffix;

        var testing = (<SVGElement>dotSeries.svg[0][0]).getAttribute('class');
        var expected = dotSeries.type + containerSuffix;

        expect(testing).toBe(expected);
    });
  });
});
