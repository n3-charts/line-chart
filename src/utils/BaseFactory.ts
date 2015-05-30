module n3Charts.Utils {
  'use strict';

  export class BaseFactory implements IFactory {

    protected key: string;
    protected factoryMgr: FactoryManager;
    protected eventMgr: EventManager;

    init(key: string, eventMgr: EventManager, factoryMgr: FactoryManager) {
      this.key = key;
      this.eventMgr = eventMgr;
      this.factoryMgr = factoryMgr;

      // Create namespaced event listener
      // and bind a proper this statement
      this.eventMgr.on('create.' + this.key, this.create.bind(this));
      this.eventMgr.on('update.' + this.key, this.update.bind(this));
      this.eventMgr.on('destroy.' + this.key, this.destroy.bind(this));
    }

    create() {
      // This methods need to be overwritten by factories
    }

    update(options, attributes: ng.IAttributes) {
      // This methods need to be overwritten by factories
    }

    destroy() {
      // This methods need to be overwritten by factories
    }
  }
}