module n3Charts.Utils {
  'use strict';

  export class EventManager {

    private _dispatch : D3.Dispatch;
    private data: Utils.Data;
    private options: Utils.Options;

    static EVENTS: string[] = [
      'create',  // on creation of the chart
      'update',  // on update of the chart
      'resize',  // on resize of the chart
      'destroy', // on destroying the chart
      'enter',   // on mouse enter a data point or column
      'over',   // on mouse over a data point or column
      'move',   // on mouse move a data point or column
      'leave',   // on mouse leave of a data point or column
      'click',   // on click on a data point or column
      'dblclick',   // on double click on a data point or column
      'legend-click',   // on click on a legend item
      'legend-over',   // on mouse over on a legend item
      'legend-out',   // on mouse out on a legend item
      'container-over',   // on mouse over on the container
      'container-move',   // on mouse move on the container
      'container-out',   // on mouse out on the container
      'focus',   // on focus of a data point from a snappy tooltip
      'toggle',  // on toggling series' visibility
      'zoom',  // on zoom/pan
    ];

    init(events:string[]) : EventManager {
      // Generate a new d3.dispatch event dispatcher
      this._dispatch = d3.dispatch.apply(this, events);

      // Support chaining
      return this;
    }

    update(data: Utils.Data, options: Utils.Options) {
      this.data = data;
      this.options = options;
      return;
    }

    on(event:string, callback:(any?) => void) : EventManager {
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

    triggerDataAndOptions(event:string, ...args: any[]) : EventManager {
      args.push(this.data);
      args.push(this.options);

      this._dispatch[event].apply(this, args);

      return this;
    }

    datumEnter(series: SeriesOptions, options: Options) {
      return (selection: D3.Selection) => {
        return selection.on('mouseenter', (d, i) => {
          this.trigger('enter', d, i, series, options);
        });
      };
    }

    datumOver(series: SeriesOptions, options: Options) {
      return (selection: D3.Selection) => {
        return selection.on('mouseover', (d, i) => {
          this.trigger('over', d, i, series, options);
        });
      };
    }

    datumMove(series: SeriesOptions, options: Options) {
      return (selection: D3.Selection) => {
        return selection.on('mousemove', (d, i) => {
          this.trigger('over', d, i, series, options);
        });
      };
    }

    datumLeave(series: SeriesOptions, options: Options) {
      return (selection: D3.Selection) => {
        return selection.on('mouseleave', (d, i) => {
          this.trigger('leave', d, i, series, options);
        });
      };
    }
  }
}
