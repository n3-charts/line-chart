/// <reference path='../app.ts' />

module n3Charts.Utils {
  'use strict';

  export class EventManager {

    private _dispatch : D3.Dispatch;

    init(events:string[]) : EventManager {
      // Generate a new d3.dispatch event dispatcher
      this._dispatch = d3.dispatch.apply(this, events);

      // Support chaining
      return this;
    }

    on(event:string, callback:() => void) : EventManager {
      // Register an event listener
      this._dispatch.on(event, callback);

      // Support chaining
      return this;
    }

    trigger(event:string, ...args: any[]) : EventManager {
      // Trigger an event, and call the event handler
      this._dispatch[event].apply(this, args);

      // Support chaining
      return this;
    }
  }
}