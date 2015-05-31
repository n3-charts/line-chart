/// <reference path='../test.mocha.ts' />

class BaseFactoryStub extends n3Charts.Utils.BaseFactory {

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

describe('n3Charts.Utils.BaseFactory', () => {
  var baseFactoryStub: BaseFactoryStub = undefined;
  var factoryMgr: n3Charts.Utils.FactoryManager = new n3Charts.Utils.FactoryManager();
  var eventMgr: n3Charts.Utils.EventManager = new n3Charts.Utils.EventManager();

  beforeEach(() => {

    baseFactoryStub = new BaseFactoryStub();
    eventMgr.init(['create', 'update', 'destroy']);
  });

  describe('init()', () => {

    it('should parse arguments', () => {
    
      expect(() => baseFactoryStub.init('test', eventMgr, factoryMgr)).to.not.throwError();
    });
  });

  describe('create(), update(), and destroy()', () => {

    it('should trigger all factory methods', () => {

      var externalState: string = undefined;

      eventMgr.on('create', () => externalState = 'created');
      eventMgr.on('update', () => externalState = 'updated');
      eventMgr.on('destroy', () => externalState = 'destroyed');

      baseFactoryStub.init('test', eventMgr, factoryMgr);

      expect(externalState).to.equal(undefined);

      eventMgr.trigger('create');

      expect(externalState).to.equal('created');
      expect(baseFactoryStub.internalState).to.equal('created stub');

      eventMgr.trigger('update');

      expect(externalState).to.equal('updated');
      expect(baseFactoryStub.internalState).to.equal('updated stub');

      eventMgr.trigger('destroy');

      expect(externalState).to.equal('destroyed');
      expect(baseFactoryStub.internalState).to.equal('destroyed stub');
    });
  });
});
