module n3Charts.Factory {
  'use strict';

  export class BaseFactory implements Utils.IFactory {

    protected key: string;
    protected factoryMgr: Utils.FactoryManager;
    protected eventMgr: Utils.EventManager;

    init(key: string, eventMgr: Utils.EventManager, factoryMgr: Utils.FactoryManager) {
      this.key = key;
      this.eventMgr = eventMgr;
      this.factoryMgr = factoryMgr;

      // Create namespaced event listener
      // and bind a proper this statement
      this.eventMgr.on('create.' + this.key, this.create.bind(this));
      this.eventMgr.on('update.' + this.key, this.update.bind(this));
      this.eventMgr.on('destroy.' + this.key, this.destroy.bind(this));
    }

    create(options: Options.Options) {
      // This methods need to be overwritten by factories
    }

    update(data: Utils.Data, options: Options.Options) {
      // This methods need to be overwritten by factories
    }

    destroy() {
      // This methods need to be overwritten by factories
    }
  }
}
