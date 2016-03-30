/// <reference path='../test.spec.ts' />

describe('n3Charts.Factory.Axis', () => {
  var domElement: JQuery = angular.element(document.body).append('<div></div>');
  var axis: n3Charts.Factory.Axis = undefined;

  beforeEach(() => {
    // Truncate the domElement
    domElement.children().remove();

    axis = new n3Charts.Factory.Axis('y');
  });

  describe('constructor()', () => {

    it('should return an instance', () => {

      axis = new n3Charts.Factory.Axis('x');

      expect(axis).toEqual(jasmine.any(n3Charts.Factory.Axis));;
    });

    it('should throw an error if side isn\'t x or y', () => {
      expect(() => new n3Charts.Factory.Axis('x')).not.toThrow();
      expect(() => new n3Charts.Factory.Axis('y')).not.toThrow();
      expect(() => new n3Charts.Factory.Axis('pouet')).toThrow();
    });
  });

  describe('extent', () => {
    it('should consider every data point', () => {
      axis = new n3Charts.Factory.Axis('y');

      var data = new n3Charts.Utils.Data({dataset0: [
        {x: 0, y: 0},
        {x: 1, y: 1},
        {x: 2, y: '-Infinity'},
        {x: 3, y: 3},
        {x: 4, y: -2}
      ]});

      var options = new n3Charts.Options.Options({
        series: [{
          axis: 'y',
          dataset: 'dataset0',
          key: 'y',
          type: 'area'
        }]
      });

      // The series doesn't tell us anything about Infinity not being defined,
      // so this result is stupid but expected.
      expect(axis.getExtent(data, options)).toEqual(['-Infinity', 3]);
    });

    it('should consider only defined data point', () => {
      axis = new n3Charts.Factory.Axis('y');

      var data = new n3Charts.Utils.Data({dataset0: [
        {x: 0, y: 0},
        {x: 1, y: 1},
        {x: 2, y: '-Infinity'},
        {x: 3, y: 3},
        {x: 4, y: -2}
      ]});

      var options = new n3Charts.Options.Options({
        series: [{
          axis: 'y',
          dataset: 'dataset0',
          key: 'y',
          type: 'area',
          defined: function(datum) {
            return typeof datum.y1 === 'number'
          }
        }]
      });

      // The series doesn't tell us anything about Infinity not being defined,
      // so this result is stupid but expected.
      expect(axis.getExtent(data, options)).toEqual([-2, 3]);
    });

  })

  it('should clone the d3 axis', () => {
    axis = new n3Charts.Factory.Axis('x');

    axis.scale = axis.getScale();
    axis.d3axis = axis.getAxis(axis['_scale'], new n3Charts.Options.AxisOptions({
      ticks: 5
    }));

    var clone = axis.cloneAxis();
    expect(clone.ticks()).toEqual(axis.d3axis.ticks());
  });
});
