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

    static DEFAULT:any = {
      series: [],
      axes: {
        x: {},
        y: {}
      },
      margin: {
        top: 0,
        left: 40,
        bottom: 40,
        right: 0
      }
    };

    public series: SeriesOptions[];
    public axes: IAxesSet;
    public margin: IMargin;

    constructor(js?:any) {
      var options = this.getSanitizedOptions(js);

      this.margin = this.sanitizeMargin(options.margin);
      this.series = this.sanitizeSeries(options.series);
      this.axes = this.sanitizeAxes(options.axes);
    }

    getSanitizedOptions(js?: any): IOptions {
      var options = <IOptions>{};

      // Extend the default options
      angular.extend(options, Options.DEFAULT, js);

      options.margin = <IMargin> Options.getObject(options, 'margin', Options.DEFAULT);
      options.series = <ISeriesOptions[]> Options.getArray(options, 'series', Options.DEFAULT);
      options.axes = <IAxesSet> Options.getObject(options, 'axes', Options.DEFAULT);

      return options;
    }

    sanitizeMargin(margin: any) {
      return <IMargin>{
        top: parseFloat(margin.top),
        left: parseFloat(margin.left),
        bottom: parseFloat(margin.bottom),
        right: parseFloat(margin.right)
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

    static getObject(raw: any, key: string, def: any) {
      // Type check because of <any> type
      if (!angular.isObject(raw[key])) {
        throw TypeError(key + ' option must be an object.');
      }

      var obj = {};

      // Extend by default options
      if (def && Object.keys(def).indexOf(key) !== -1) {
        angular.extend(obj, def[key], raw[key]);
      }

      return obj;
    }

    static getArray(raw: any, key: string, def: any) {
      // Type check because of <any> type
      if (!angular.isArray(raw[key])) {
        throw TypeError(key + ' option must be an array.');
      }

      var arr = [];

      // Extend by default options
      if (def && Object.keys(def).indexOf(key) !== -1) {
        angular.extend(arr, def[key], raw[key]);
      }

      return arr;
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
