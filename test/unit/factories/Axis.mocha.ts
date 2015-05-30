/// <reference path='../test.mocha.ts' />

describe('n3Charts.Factory.Axis', () => {
  var domElement: JQuery = angular.element(document.body).append('<div></div>');
  var axis: n3Charts.Factory.Axis = undefined;
  var eventMgr: n3Charts.Utils.EventManager = undefined;
  var factoryMgr: n3Charts.Utils.FactoryManager = undefined;

  beforeEach(() => {
    // Truncate the domElement
    domElement.children().remove();

    axis = new n3Charts.Factory.Axis('y');
    eventMgr = n3Charts.Utils.EventManager.DEFAULT();
    factoryMgr = new n3Charts.Utils.FactoryManager();
  });

  describe('constructor', () => {
    it('should throw an error if name isn\'t x or y', () => {
      expect(() => {axis = new n3Charts.Factory.Axis('pouet');}).to.throwError();
    });
  });

  describe('lifecycle', () => {
    beforeEach(() => {
      factoryMgr
        .register('container', n3Charts.Factory.Container, domElement[0])
        .get('container')
        .init('super-key', eventMgr, factoryMgr)
        .create();

      axis.init('super-key', eventMgr, factoryMgr);
    });

    it('should be complete', () => {
      eventMgr.trigger('create');
      eventMgr.trigger('update');
    });
  });
});
