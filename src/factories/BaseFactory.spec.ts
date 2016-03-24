/// <reference path='../test.spec.ts' />

class ChildFactoryStub extends n3Charts.Factory.BaseFactory {

  public internalState: string = undefined;

  create() {
    this.internalState = 'created stub';
  }

  update() {
    this.internalState = 'updated stub';
  }

  destroy() {
    this.internalState = 'destroyed stub';
  }
}

describe('n3Charts.Factory.BaseFactory', () => {
  var childFactoryStub: ChildFactoryStub = undefined;
  var factoryMgr: n3Charts.Utils.FactoryManager = new n3Charts.Utils.FactoryManager();
  var eventMgr: n3Charts.Utils.EventManager = new n3Charts.Utils.EventManager();

  beforeEach(() => {

    childFactoryStub = new ChildFactoryStub();
    eventMgr.init(n3Charts.Utils.EventManager.EVENTS);
  });

  describe('init()', () => {

    it('should parse arguments', () => {

      expect(() => childFactoryStub.init('test', eventMgr, factoryMgr)).not.toThrow();
    });
  });

  describe('create(), update(), and destroy()', () => {

    it('should trigger all factory methods', () => {

      var externalState: string = undefined;

      eventMgr.on('create', () => externalState = 'created');
      eventMgr.on('update', () => externalState = 'updated');
      eventMgr.on('destroy', () => externalState = 'destroyed');

      childFactoryStub.init('test', eventMgr, factoryMgr);

      expect(externalState).toBe(undefined);

      eventMgr.trigger('create');

      expect(externalState).toBe('created');
      expect(childFactoryStub.internalState).toBe('created stub');

      eventMgr.trigger('update');

      expect(externalState).toBe('updated');
      expect(childFactoryStub.internalState).toBe('updated stub');

      eventMgr.trigger('destroy');

      expect(externalState).toBe('destroyed');
      expect(childFactoryStub.internalState).toBe('destroyed stub');
    });
  });
});
