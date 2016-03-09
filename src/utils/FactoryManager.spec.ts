/// <reference path='../test.spec.ts' />

// A simple factory stub
class FactoryStub {

  public args:any[];

  constructor(...args:any[]) {
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

    factoryMgr.register('stub1', FactoryStub);
      factoryMgr.register('stub2', FactoryStub);

      expect(factoryMgr.index('stub1')).toBe(0);
      expect(factoryMgr.index('stub2')).toBe(1);
    });

    it('should return -1 if index of the factory does not exist', () => {

      factoryMgr.register('stub1', FactoryStub);

      expect(factoryMgr.index('stub2')).toBe(-1);
    });
  });

  describe('get()', () => {

    it('should return the factory instance by key', () => {

      factoryMgr.register('stub1', FactoryStub);
      factoryMgr.register('stub2', FactoryStub);

      expect(factoryMgr.get('stub1')).toEqual(jasmine.any(FactoryStub));;
      expect(factoryMgr.get('stub2')).toEqual(jasmine.any(FactoryStub));;
      expect(factoryMgr.get('stub1')).not.toBe(factoryMgr.get('stub2'));
    });
  });

  describe('all()', () => {

    it('should return all factory entries', () => {

      var enties: n3Charts.Utils.IFactoryEntry[] = undefined;

      factoryMgr.register('stub1', FactoryStub);
      factoryMgr.register('stub2', FactoryStub);

      enties = factoryMgr.all();

      expect(enties[0].key).toBe('stub1');
      expect(enties[0].instance).toEqual(jasmine.any(FactoryStub));;

      expect(enties[1].key).toBe('stub2');
      expect(enties[1].instance).toEqual(jasmine.any(FactoryStub));;

      expect(enties[0].instance).not.toBe(enties[1].instance);
    });
  });

  describe('registerMany()', () => {

    it('should register many factories', () => {

      var factoryStub1 = undefined;
      var factoryStub2 = undefined;

      factoryMgr.registerMany([
        ['stub1', FactoryStub, 'arg1', 2, true],
        ['stub2', FactoryStub, 'arg2', 3, false]
      ]);

      factoryStub1 = factoryMgr.get('stub1');
      expect(factoryStub1).toEqual(jasmine.any(FactoryStub));;
      expect(factoryStub1.args[0]).toBe('arg1');
      expect(factoryStub1.args[1]).toBe(2);
      expect(factoryStub1.args[2]).toBe(true);

      factoryStub2 = factoryMgr.get('stub2');
      expect(factoryStub2).toEqual(jasmine.any(FactoryStub));;
      expect(factoryStub2.args[0]).toBe('arg2');
      expect(factoryStub2.args[1]).toBe(3);
      expect(factoryStub2.args[2]).toBe(false);
    });

    it('should return the instance', () => {

      expect(factoryMgr.registerMany([])).toBe(factoryMgr);
    });
  });

  describe('register()', () => {

    it('should pass additional arguments to constructor', () => {

      var factoryStub = undefined;

      factoryMgr.register('stub', FactoryStub, 'arg1', 2, true);
      factoryStub = factoryMgr.get('stub');

      expect(factoryStub.args[0]).toBe('arg1');
      expect(factoryStub.args[1]).toBe(2);
      expect(factoryStub.args[2]).toBe(true);
    });

    it('should return the instance of the factory', () => {

      var f = factoryMgr.register('stub', FactoryStub);

      expect(f).toEqual(jasmine.any(FactoryStub));;
    });
  });

  describe('unregister()', () => {

    it('should remove the factory entry', () => {

      factoryMgr.register('stub', FactoryStub);

      expect(factoryMgr.index('stub')).toBe(0);
      expect(factoryMgr.get('stub')).toEqual(jasmine.any(FactoryStub));;

      factoryMgr.unregister('stub');

      expect(factoryMgr.index('stub')).toBe(-1);
      expect(factoryMgr.get('stub')).toBe(null);
    });

    it('should return the instance', () => {

      factoryMgr.register('stub', FactoryStub);

      expect(factoryMgr.unregister('stub')).toBe(factoryMgr);
    });
  });
});
