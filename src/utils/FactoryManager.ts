module n3Charts.Utils {
  'use strict';

  export interface IFactory {
    init(key: string, eventMgr: EventManager, factoryMgr: FactoryManager);
    create(options: Options.Options);
    update(datasets, options, attributes: ng.IAttributes);
    destroy();
    off();
    isOff();
    on();
    isOn();
  }

  export interface IFactoryEntry {
    key: string;
    instance: IFactory;
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

    getBoundFunction(factoryKey: string, functionName: string): any {
      let factory = this.get(factoryKey);

      if (!factory) {
        return null;
      }

      return factory[functionName].bind(factory);
    }

    // This should return a more meaningful type...
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
      return this._factoryStack;
    }

    turnFactoriesOff(keys: string[]):Function {
      var toUndo = [];
      keys.forEach((key) => {
        let f = this.get(key);

        if (f.isOn()) {
          f.off();
          toUndo.push(key);
        }
      });

      return () => this.turnFactoriesOn(toUndo);
    }

    turnFactoriesOn(keys: string[]):Function {
      var toUndo = [];
      keys.forEach((key) => {
        let f = this.get(key);

        if (f.isOff()) {
          f.on();
          toUndo.push(key);
        }
      });

      return () => this.turnFactoriesOff(toUndo);
    }

    registerMany(factories: any[]) {
      // Loop over the factories
      factories.forEach((factoryArgs) => {
        // Register each of them, applying all
        // values as arguments
        this.register.apply(this, factoryArgs);
      });

      // Support chaining
      return this;
    }

    register(key: string, constructor: any, ...args:any[])  {
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

      // Return the instance
      return instance;
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
