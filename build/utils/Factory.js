/// <reference path='../app.ts' />
var n3Charts;
(function (n3Charts) {
    var Utils;
    (function (Utils) {
        'use strict';
        var BaseFactory = (function () {
            function BaseFactory() {
            }
            BaseFactory.prototype.init = function (key, em, fm) {
                this.key = key;
                this.em = em;
                this.fm = fm;
                // Create namespaced event listener
                // and bind a proper this statement
                this.em.on('create.' + this.key, this.create.bind(this));
                this.em.on('update.' + this.key, this.update.bind(this));
                this.em.on('destroy.' + this.key, this.destroy.bind(this));
            };
            BaseFactory.prototype.create = function () {
                // This methods need to be overwritten by factories
            };
            BaseFactory.prototype.update = function () {
                // This methods need to be overwritten by factories
            };
            BaseFactory.prototype.destroy = function () {
                // This methods need to be overwritten by factories
            };
            return BaseFactory;
        })();
        Utils.BaseFactory = BaseFactory;
        var FactoryManager = (function () {
            function FactoryManager() {
                // A stack of all factories, preserves order
                this._factoryStack = [];
            }
            FactoryManager.prototype.index = function (factoryKey) {
                // Return the index of a factory by the factoryKey
                return this._factoryStack
                    .map(function (d) { return d.key; })
                    .indexOf(factoryKey);
            };
            FactoryManager.prototype.get = function (factoryKey) {
                // Get the index of the factory
                var index = this.index(factoryKey);
                // Return the factory instance
                if (index > -1) {
                    return this._factoryStack[index].instance;
                }
                // Well, no factory found
                return null;
            };
            FactoryManager.prototype.all = function () {
                // Return the complete stack
                return this._factoryStack;
            };
            FactoryManager.prototype.register = function (key, constructor) {
                var args = [];
                for (var _i = 2; _i < arguments.length; _i++) {
                    args[_i - 2] = arguments[_i];
                }
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
            };
            FactoryManager.prototype.unregister = function (factoryKey) {
                // Get the index of the factory
                var index = this.index(factoryKey);
                // And delete the factory
                if (index > -1) {
                    delete this._factoryStack[index];
                }
                // Support chaining
                return this;
            };
            return FactoryManager;
        })();
        Utils.FactoryManager = FactoryManager;
    })(Utils = n3Charts.Utils || (n3Charts.Utils = {}));
})(n3Charts || (n3Charts = {}));
//# sourceMappingURL=Factory.js.map