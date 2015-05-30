/// <reference path='../app.ts' />

module n3Charts.Utils {
  'use strict';

  export interface IFactory {
    init(key: string, em: EventManager, fm: FactoryManager);
    create();
    update();
    destroy();
  }

  export interface IFactoryEntry {
    key: string;
    instance: IFactory;
  }

  export class BaseFactory implements IFactory {

    protected key: string;
    protected fm: FactoryManager;
    protected em: EventManager;

    init(key:string, em: EventManager, fm: FactoryManager) {
      this.key = key;
      this.em = em;
      this.fm = fm;

      // Create namespaced event listener
      // and bind a proper this statement
      this.em.on('create.' + this.key, this.create.bind(this));
      this.em.on('update.' + this.key, this.update.bind(this));
      this.em.on('destroy.' + this.key, this.destroy.bind(this));
    }

    create() {
      // This methods need to be overwritten by factories
    }

    update() {
      // This methods need to be overwritten by factories
    }

    destroy() {
      // This methods need to be overwritten by factories
    }
  }

  export class FactoryManager {

    // A stack of all factories, preserves order
    private _factoryStack: IFactoryEntry[] = [];

    index(factoryKey: string): number {
      // Return the index of a factory by the factoryKey
      return this._factoryStack
        .map((d) => d.key)
        .indexOf(factoryKey);
    }

    get(factoryKey: string): any {
      // Get the index of the factory
      var index = this.index(factoryKey);

      // Return the factory instance
      if (index > -1) {
        return this._factoryStack[index].instance;
      }

      // Well, no factory found
      return null;
    }

    all(): IFactoryEntry[] {
      // Return the complete stack
      return this._factoryStack;
    }

    register(key: string, constructor: any, ...args:any[]): FactoryManager {
      // This generates a new factory constructor, applying
      // the additional args to the original constructor;
      // it preserves the name of the original constructor
      var factory = constructor.bind.apply(constructor, [null].concat(args));

      // Let's create a new instance of the factory
      var instance = new factory();

      // and push the entry to the factory stack
      this._factoryStack.push({
        key: key,
        instance: instance
      });

      // Support chaining
      return this;
    }

    unregister(factoryKey): FactoryManager {
      // Get the index of the factory
      var index = this.index(factoryKey);

      // And delete the factory
      if (index > -1) {
        delete this._factoryStack[index];
      }

      // Support chaining
      return this;
    }
  }
}