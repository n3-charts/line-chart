module n3Charts.Utils {
  'use strict';

  export interface IAxesSet {
    x: IAxisOptions;
    y: IAxisOptions;
    y2?: IAxisOptions;
  };

  export interface IMargin {
    top: number;
    left: number;
    bottom: number;
    right: number;
  }

  export interface IGrid {
    x: boolean;
    y: boolean;
  }

  export interface IOptions {
    series: ISeriesOptions[];
    axes: IAxesSet;
    margin: IMargin;
    grid: IGrid;
    tooltipHook: Function;
  }

  export class Options implements IOptions {

    public tooltipHook: Function;

    public series: ISeriesOptions[] = [];

    public axes: IAxesSet = {
      x: <IAxisOptions>{},
      y: <IAxisOptions>{}
    };

    public margin: IMargin = {
      top: 0,
      left: 40,
      bottom: 40,
      right: 0
    };

    public grid: IGrid = {
      x: false,
      y: true
    };

    constructor(js?:any) {
      var options = this.sanitizeOptions(js);

      this.margin = options.margin;
      this.series = options.series;
      this.axes = options.axes;
      this.grid = options.grid;
      this.tooltipHook = options.tooltipHook;
    }

    /**
     * Make sure that the options have proper types,
     * and convert raw js to typed variables
     */
    sanitizeOptions(js?: any): IOptions {
      var options = <IOptions>{};

      // Extend the default options
      angular.extend(options, this, js);

      options.margin = this.sanitizeMargin(Options.getObject(options.margin, this.margin));
      options.series = this.sanitizeSeries(Options.getArray(options.series));
      options.axes = this.sanitizeAxes(Options.getObject(options.axes, this.axes));
      options.grid = this.sanitizeGridOptions(options.grid);
      options.tooltipHook = Options.getFunction(options.tooltipHook);

      return options;
    }

    sanitizeMargin(margin: any): IMargin {
      return <IMargin>{
        top: Options.getNumber(margin.top, 0),
        left: Options.getNumber(margin.left, 0),
        bottom: Options.getNumber(margin.bottom, 0),
        right: Options.getNumber(margin.right, 0)
      };
    }

    sanitizeSeries(series: any[]): ISeriesOptions[]  {
      return (series).map((s) => new SeriesOptions(s));
    }

    sanitizeGridOptions(grid: any): IGrid {
      var g = {
        x: Options.getBoolean(grid.x, false),
        y: Options.getBoolean(grid.y, true)
      };

      return g;
    }

    sanitizeAxes(axes: any): IAxesSet {
      // Map object keys and return a new object
      return <IAxesSet> Object.keys(axes).reduce((prev, key) => {
        prev[key] = new AxisOptions(axes[key]);
        return prev;
      }, {});
    }

    getAbsKey(): string {
      if (!this.axes[AxisOptions.SIDE.X]) {
        throw new TypeError('Cannot find abs key : ' + AxisOptions.SIDE.X);
      }

      return this.axes[AxisOptions.SIDE.X].key;
    }

    getByAxisSide(side: string): AxisOptions {
        if (!AxisOptions.isValidSide(side)) {
            throw new TypeError('Cannot get axis side : ' + side);
        }

        return this.axes[side];
    }

    getSeriesByType(type: string): ISeriesOptions[] {
      if (!SeriesOptions.isValidType(type)) {
        throw new TypeError('Unknown series type: ' + type);
      }

      return this.series.filter((s) => s.hasType(type));
    }

    static getBoolean(value: any, defaultValue: boolean = true) {
      if (typeof value === 'boolean') {
        return value;
      }

      return defaultValue;
    }

    static getNumber(value: any, defaultValue: number) {
      var n = parseFloat(value);
      return !isNaN(n) ? n : defaultValue;
    }

    static getDate(value: any, defaultValue: Date) {
      return value instanceof Date ? value : defaultValue;
    }

    static getFunction(value: any) {
      return value instanceof Function ? value : undefined;
    }

    static getString(value: any, defaultValue?: string) {
      return value ? String(value) : defaultValue;
    }

    static getIdentifier(value: any) {
      var s = Options.getString(value);
      return s.replace(/[^a-zA-Z0-9\-_]/ig, '');
    }

    static getObject(value: any, defaultValue: any = {}) {
      // Type check because *val* is of type any
      if (!angular.isObject(value)) {
        throw TypeError(value + ' option must be an object.');
      }

      var obj = {};

      // Extend by default parameter
      angular.extend(obj, defaultValue, value);

      return obj;
    }

    static getArray(value: any|any[], defaultValue: any[] = []) {
      return defaultValue.concat(value);
    }

    static uuid() {
      // @src: http://stackoverflow.com/a/2117523
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
        .replace(/[xy]/g, (c) => {
            var r = Math.random() * 16 | 0;
            var v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          }
        );
    }
  }
}
