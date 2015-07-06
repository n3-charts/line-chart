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

      expect(axis).to.be.a(n3Charts.Factory.Axis);
    });

    it('should throw an error if side isn\'t x or y', () => {

      expect(() => new n3Charts.Factory.Axis('x')).to.not.throwError();
      expect(() => new n3Charts.Factory.Axis('y')).to.not.throwError();
      expect(() => new n3Charts.Factory.Axis('pouet')).to.throwError();
    });
  });
});
