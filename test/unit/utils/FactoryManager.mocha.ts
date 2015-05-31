/// <reference path='../test.mocha.ts' />

// A simple factory stub
class FactoryStub {

  public args:any[];

  constructor(...args:any[]){
    this.args = args;
  }
}

describe('n3Charts.Utils.FactoryManager', () => {
  var factoryMgr: n3Charts.Utils.FactoryManager = undefined;

  beforeEach(() => {

    factoryMgr = new n3Charts.Utils.FactoryManager();
  });

  describe('index()', () => {

    it('should return the index of the factory entry', () => {

      var f = factoryMgr
        .register('stub1', FactoryStub)
        .register('stub2', FactoryStub);

      expect(f.index('stub1')).to.equal(0);
      expect(f.index('stub2')).to.equal(1);
    });

    it('should return -1 if index of the factory does not exist', () => {

      var f = factoryMgr.register('stub1', FactoryStub);

      expect(f.index('stub2')).to.equal(-1);
    });
  });

  describe('get()', () => {

    it('should return the factory instance by key', () => {

      var f = factoryMgr
        .register('stub1', FactoryStub)
        .register('stub2', FactoryStub);

      expect(f.get('stub1')).to.be.a(FactoryStub);
      expect(f.get('stub2')).to.be.a(FactoryStub);
      expect(f.get('stub1')).to.not.equal(factoryMgr.get('stub2'));
    });
  });

  describe('all()', () => {

    it('should return all factory entries', () => {

      var enties: n3Charts.Utils.IFactoryEntry[] = undefined;
      
      var f = factoryMgr
        .register('stub1', FactoryStub)
        .register('stub2', FactoryStub);

      enties = f.all();

      expect(enties[0].key).to.equal('stub1');
      expect(enties[0].instance).to.be.a(FactoryStub);

      expect(enties[1].key).to.equal('stub2');
      expect(enties[1].instance).to.be.a(FactoryStub);
      
      expect(enties[0].instance).to.not.equal(enties[1].instance);
    });
  });

  describe('register()', () => {

    it('should pass additional arguments to constructor', () => {

      var factoryStub = undefined;

      factoryMgr.register('stub', FactoryStub, 'arg1', 2, true);
      factoryStub = factoryMgr.get('stub');

      expect(factoryStub.args[0]).to.equal('arg1');
      expect(factoryStub.args[1]).to.equal(2);
      expect(factoryStub.args[2]).to.equal(true);
    });

    it('should return the instance', () => {
      
      var f = factoryMgr.register('stub', FactoryStub);

      expect(f).to.equal(factoryMgr);
    });
  });

  describe('unregister()', () => {

    it('should remove the factory entry', () => {
      
      var f = factoryMgr.register('stub', FactoryStub);
      
      expect(f.index('stub')).to.equal(0);
      expect(f.get('stub')).to.be.a(FactoryStub);

      f.unregister('stub');

      expect(f.index('stub')).to.equal(-1);
      expect(f.get('stub')).to.equal(null);
    });

    it('should return the instance', () => {
      
      var f = factoryMgr.register('stub', FactoryStub);

      expect(f.unregister('stub')).to.equal(factoryMgr);
    });
  });
});
