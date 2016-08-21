module n3Charts.Utils {
  'use strict';

  export class EventManager {

    private _dispatch : d3.Dispatch;
    private data: Utils.Data;
    private options: Options.Options;

    // For testing purposes
    public strictMode: Boolean = true;

    static EVENTS: string[] = [
      'create',  // on creation of the chart
      'update',  // on update of the chart
      'data-update',  // on update of the data (slightly different from redrawing the entire chart)
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


      'outer-world-hover',  // on incoming sync event (tooltip)
      'outer-world-domain-change',  // on incoming sync event (pan zoom)

      'pan',  // on pan end
      'pan-end',  // on pan end
      'zoom',  // brushy brushy brushy
      'zoom-end',  // BRUSHY BRUSHY BRUSHY
      'zoom-pan-reset',  // no brushy

      'window-mouseup',
      'window-mousemove',
    ];

    init(events:string[]): EventManager {
      // Generate a new d3.dispatch event dispatcher
      this._dispatch = d3.dispatch.apply(this, events);

      // Not sure about that... it's supposed to avoid several directives to
      // replace each others' listeners, but is a timestamp really unique ?
      let id = new Date().getTime();
      d3.select(window).on('mouseup.' + id, () => {
        // (<Event>d3.event).preventDefault();
        this.trigger('window-mouseup')
      });
      d3.select(window).on('mousemove.' + id, () => {
        // (<Event>d3.event).preventDefault();
        this.trigger('window-mousemove')
      });

      // Support chaining
      return this;
    }

    update(data: Utils.Data, options: Options.Options) {
      this.data = data;
      this.options = options;
      return;
    }

    on(event:string, callback:(...args:any[]) => any) : EventManager {
      if (this.strictMode && EventManager.EVENTS.indexOf(event.split('.')[0]) === -1) {
        throw new Error(`Unknown event: ${event}`);
      }

      this._dispatch.on(event, callback);
      return this;
    }

    trigger(event:string, ...args: any[]) : EventManager {
      this._dispatch[event].apply(this, args);
      return this;
    }

    triggerDataAndOptions(event:string, ...args: any[]) : EventManager {
      args.push(this.data);
      args.push(this.options);

      this._dispatch[event].apply(this, args);

      return this;
    }

    datumEnter(series: Options.SeriesOptions, options: Options.Options) {
      return (selection: d3.Selection<Utils.IPoint>) => {
        return selection.on('mouseenter', (d, i) => {
          this.trigger('enter', d, i, series, options);
        });
      };
    }

    datumOver(series: Options.SeriesOptions, options: Options.Options) {
      return (selection: d3.Selection<Utils.IPoint>) => {
        return selection.on('mouseover', (d, i) => {
          this.trigger('over', d, i, series, options);
        });
      };
    }

    datumMove(series: Options.SeriesOptions, options: Options.Options) {
      return (selection: d3.Selection<Utils.IPoint>) => {
        return selection.on('mousemove', (d, i) => {
          this.trigger('over', d, i, series, options);
        });
      };
    }

    datumLeave(series: Options.SeriesOptions, options: Options.Options) {
      return (selection: d3.Selection<Utils.IPoint>) => {
        return selection.on('mouseleave', (d, i) => {
          this.trigger('leave', d, i, series, options);
        });
      };
    }

    // That would be so cool to have native dblclick support in D3...
    listenForDblClick(selection: d3.Selection<any>, callback: Function, listenerSuffix:string): d3.Selection<any> {
      let down,
        tolerance = 5,
        last,
        wait = null;

      let dist = (a:number[], b:number[]):number => {
        return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
      };

      selection.on('mousedown.dbl.' + listenerSuffix, function() {
        down = d3.mouse(document.body);
        last = new Date().getTime();
      });

      selection.on('mouseup.dbl.' + listenerSuffix, () => {
        if (!down || dist(down, d3.mouse(document.body)) > tolerance) {
          return;
        }

        if (wait && this.options.doubleClickEnabled) {
          window.clearTimeout(wait);
          wait = null;
          callback(d3.event);
        } else {
          wait = window.setTimeout((function(e) {
            return function() {
              wait = null;
            };
          })(d3.event), 300);
        }
      });

      return selection;
    }
  }
}
