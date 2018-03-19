import {expect} from 'chai';

import * as Utils from '../utils/_index';
import * as Options from '../options/_index';
import { BaseFactory } from './BaseFactory';

class ChildFactoryStub extends BaseFactory {

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

describe('Factory.BaseFactory', () => {
  var childFactoryStub: ChildFactoryStub = undefined;
  var factoryMgr: Utils.FactoryManager = new Utils.FactoryManager();
  var eventMgr: Utils.EventManager = new Utils.EventManager();

  beforeEach(() => {

    childFactoryStub = new ChildFactoryStub();
    eventMgr.init(Utils.EventManager.EVENTS);
  });

  describe('init()', () => {

    it('should parse arguments', () => {

      expect(() => childFactoryStub.init('test', eventMgr, factoryMgr)).not.to.throw();
    });
  });

  describe('create(), update(), and destroy()', () => {

    it('should trigger all factory methods', () => {

      var externalState: string = undefined;

      eventMgr.on('create', () => externalState = 'created');
      eventMgr.on('update', () => externalState = 'updated');
      eventMgr.on('destroy', () => externalState = 'destroyed');

      childFactoryStub.init('test', eventMgr, factoryMgr);

      expect(externalState).to.equal(undefined);

      eventMgr.trigger('create');

      expect(externalState).to.equal('created');
      expect(childFactoryStub.internalState).to.equal('created stub');

      eventMgr.trigger('update');

      expect(externalState).to.equal('updated');
      expect(childFactoryStub.internalState).to.equal('updated stub');

      eventMgr.trigger('destroy');

      expect(externalState).to.equal('destroyed');
      expect(childFactoryStub.internalState).to.equal('destroyed stub');
    });
  });
});
