import * as Utils from '../utils/_index';
import * as Options from '../options/_index';
import * as Types from '../options/Types';

export class BaseFactory implements Utils.IFactory {

  protected key: string;
  protected factoryMgr: Utils.FactoryManager;
  protected eventMgr: Utils.EventManager;
  private enabled: Boolean = true;

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

  on() {
    this.enabled = true;
  }

  off() {
    this.enabled = false;
  }

  isOn() {
    return this.enabled === true;
  }

  isOff() {
    return this.enabled === false;
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

  static evalCondString(condValue: Types.condString, value?: Number): String {
    return condValue instanceof Function ? condValue(value, undefined, undefined) : condValue;
  }
}
