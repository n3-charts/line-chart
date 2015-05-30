/// <reference path='../app.ts' />
var n3Charts;
(function (n3Charts) {
    var Utils;
    (function (Utils) {
        'use strict';
        var EventManager = (function () {
            function EventManager() {
            }
            EventManager.prototype.init = function (events) {
                // Generate a new d3.dispatch event dispatcher
                this._dispatch = d3.dispatch.apply(this, events);
                // Support chaining
                return this;
            };
            EventManager.prototype.on = function (event, callback) {
                // Register an event listener
                this._dispatch.on(event, callback);
                // Support chaining
                return this;
            };
            EventManager.prototype.trigger = function (event) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                // Trigger an event, and call the event handler
                this._dispatch[event].apply(this, args);
                // Support chaining
                return this;
            };
            return EventManager;
        })();
        Utils.EventManager = EventManager;
    })(Utils = n3Charts.Utils || (n3Charts.Utils = {}));
})(n3Charts || (n3Charts = {}));
//# sourceMappingURL=Event.js.map