/// <reference path='../test.mocha.ts' />

/// <reference path='../../src/factories/Stage.ts' />

describe('Stage', () => {
  var domElement:JQuery = undefined;
  var stage:Stage = undefined;

  beforeEach(() => {
    domElement = angular.element(document.body).append('<div></div>');
    stage = new Stage(domElement);
  });


  it('should exist', () => {
    expect(stage).not.to.equal(undefined);
  });

});
