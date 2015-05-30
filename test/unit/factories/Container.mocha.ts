/// <reference path='../test.mocha.ts' />

describe('n3Charts.Factory.Container', () => {
  var domElement: HTMLElement = undefined;
  var container: n3Charts.Factory.Container = undefined;

  beforeEach(() => {
    domElement = angular.element(document.body).append('<div></div>')[0];
    container = new n3Charts.Factory.Container(domElement);
  });

  it('should exist', () => {
    expect(container).not.to.equal(undefined);
  });

});
