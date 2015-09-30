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

  export interface IOptions {
    series: ISeriesOptions[];
    axes: IAxesSet;
    margin: IMargin;
  }

  export class Options implements IOptions {

    public series: SeriesOptions[] = [];

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

    constructor(js?:any) {
      var options = this.sanitizeOptions(js);

      this.margin = this.sanitizeMargin(options.margin);
      this.series = this.sanitizeSeries(options.series);
      this.axes = this.sanitizeAxes(options.axes);
    }

    /**
     * Make sure that the options have proper types,
     * and convert raw js to typed variables
     */
    sanitizeOptions(js?: any): IOptions {
      var options = <IOptions>{};

      // Extend the default options
      angular.extend(options, this, js);

      options.margin = <IMargin> Options.getObject(options.margin, this.margin);
      options.series = <ISeriesOptions[]> Options.getArray(options.series);
      options.axes = <IAxesSet> Options.getObject(options.axes, this.axes);

      return options;
    }

    sanitizeMargin(margin: any) {
      return <IMargin>{
        top: Options.getNumber(margin.top),
        left: Options.getNumber(margin.left),
        bottom: Options.getNumber(margin.bottom),
        right: Options.getNumber(margin.right)
      };
    }

    sanitizeSeries(series: any[]) {
      return (series).map((s) => new SeriesOptions(s));
    }

    sanitizeAxes(axes: any) {
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

    getByAxisSide(side: string) {
        if (!AxisOptions.isValidSide(side)) {
            throw new TypeError('Cannot get axis side : ' + side);
        }

        return this.axes[side];
    }

    getSeriesByType(type: string) {
      if (!SeriesOptions.isValidType(type)) {
        throw new TypeError('Unknown series type: ' + type);
      }

      return this.series.filter((s) => s.hasType(type));
    }

    static getBoolean(value: any, defaultValue: boolean = true) {
      return !(value === !defaultValue);
    }

    static getNumber(value: any, defaultValue: number = 0) {
      var n = parseFloat(value);
      return !isNaN(n) ? n : defaultValue;
    }

    static getString(value: any) {
      var s = String(value);
      return s;
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
