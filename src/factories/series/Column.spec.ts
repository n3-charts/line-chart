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
    var container: SVGElement;

    beforeEach(() => {
        container = <SVGElement>domElement[0].getElementsByTagName('svg')[0];
        columnSeries.createContainer(d3.select(container));
    });

    it('should create a <g> container', () => {
        var testing = (<SVGElement>columnSeries.svg[0][0]).tagName;
        var expected = 'g';

        expect(testing).toBe(expected);
    });

    it('should define a proper class', () => {
        var containerSuffix = n3Charts.Factory.Series.SeriesFactory.containerClassSuffix;

        var testing = (<SVGElement>columnSeries.svg[0][0]).getAttribute('class');
        var expected = columnSeries.type + containerSuffix;

        expect(testing).toBe(expected);
    });
  });
});
