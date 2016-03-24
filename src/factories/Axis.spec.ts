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
