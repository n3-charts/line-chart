module n3Charts.Utils {
  'use strict';

  export class EventManager {

    private _dispatch : D3.Dispatch;

    static EVENTS: string[] = [
      'create',  // on creation of the chart
      'update',  // on update of the chart
      'destroy', // on destroying the chart
      'hover',   // on hover over a data point or column
      'click',   // on click on a data point or column
      'focus',   // on focus of a data point from a snappy tooltip
      'toggle',  // on toggling series' visibility
    ];

    static DEFAULT = () => {
      return new EventManager().init(EventManager.EVENTS);
    };


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
