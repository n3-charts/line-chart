module n3Charts.Utils {
  'use strict';

  export class EventManager {

    private _dispatch : D3.Dispatch;

    static EVENTS: string[] = [
      'create',  // on creation of the chart
      'update',  // on update of the chart
      'destroy', // on destroying the chart
      'over',   // on mouse over a data point or column
      'out',   // on mouse out of a data point or column
      'click',   // on click on a data point or column
      'legend-click',   // on click on a legend item
      'legend-over',   // on mouse over on a legend item
      'legend-out',   // on mouse out on a legend item
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
      // TODO We need to add an $apply() in here
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

    datumOver(series: Utils.Series) {
      return (selection: D3.Selection) => {
        return selection.on('mouseover', (d, i) => {
          this.trigger('over', d, i, series);
        });
      };
    }

    datumOut(series: Utils.Series) {
      return (selection: D3.Selection) => {
        return selection.on('mouseout', (d, i) => {
          this.trigger('out', d, i, series);
        });
      };
    }

    legendClick() {
      return (selection: D3.Selection) => {
        return selection.on('click', (series) => {
          this.trigger('legend-click', series);
        });
      };
    }
  }
}
