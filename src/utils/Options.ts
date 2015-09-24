module n3Charts.Utils {
  'use strict';

  export interface IAxes {
    x: AxisOptions;
    y: AxisOptions;
    y2?: AxisOptions;
  };

  export interface IMargin {
    top: number;
    left: number;
    bottom: number;
    right: number;
  }

  export class Options {

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

    static SERIES_TYPES = {
      DOT: 'dot',
      LINE: 'line',
      AREA: 'area',
      COLUMN: 'column'
    };

    public series: SeriesOptions[];
    public axes: IAxes;
    public margin: IMargin;

    constructor(js?:any) {
      this.parse(js);
    }

    parse(js?:any) {
      var options = <any>{};

      // Extend the default options
      angular.extend(options, Options.DEFAULT, js);

      this.series = this.parseSeries(options.series);
      this.axes = this.parseAxes(options.axes);
      this.margin = this.parseMargin(options.margin);
    }

    parseMargin(jsMargin: any): IMargin {
      // Type check because of <any> type
      if (!angular.isObject(jsMargin)) {
        throw TypeError('Margin option must be an object.');
      }

      var margin = {};

      // Extend the default margin options
      angular.extend(margin, Options.DEFAULT.margin, jsMargin);

      return this.sanitizeMargin(margin);
    }

    parseSeries(jsSeries: any): SeriesOptions[] {
      // Type check because of <any> type
      if (!angular.isArray(jsSeries)) {
        throw TypeError('Series option must be an array.');
      }

      var series = [];

      // Extend the default series options
      angular.extend(series, Options.DEFAULT.series, jsSeries);

      return this.sanitizeSeries(series);
    }

    parseAxes(jsAxes: any): IAxes {
      // Type check because of <any> type
      if (!angular.isObject(jsAxes)) {
        throw TypeError('Axes option must be an object.');
      }

      var axes = {};

      // Extend the default axes options
      angular.extend(axes, Options.DEFAULT.axes, jsAxes);

      return this.sanitizeAxes(axes);
    }

    sanitizeSeries(series: any[]) {
      return (series).map((s) => new SeriesOptions(s));
    }

    sanitizeAxes(axes: any) {
      // Map object keys and return a new object
      return <IAxes> Object.keys(axes).reduce((prev, key) => {
        prev[key] = new AxisOptions(axes[key]);
        return prev;
      }, {});
    }

    sanitizeMargin(margin) {
      return <IMargin> {
        top: parseFloat(margin.top),
        left: parseFloat(margin.left),
        bottom: parseFloat(margin.bottom),
        right: parseFloat(margin.right)
      };
    }

    isValidAxisSide(side:string): Boolean {
      return d3.values(Factory.Axis).indexOf(side) === -1
        ? false : true;
    }

    isValidSeriesType(type:string): Boolean {
      return d3.values(Options.SERIES_TYPES).indexOf(type) === -1
        ? false : true;
    }

    getAbsKey(): string {
      if (!this.axes[Factory.Axis.SIDE.X]) {
        throw new TypeError('Cannot find abs key : ' + Factory.Axis.SIDE.X);
      }

      return this.axes[Factory.Axis.SIDE.X].key;
    }

    getByAxisSide(side: string) {
        if (!this.isValidAxisSide(side)) {
            throw new TypeError('Cannot get axis side : ' + side);
        }

        return this.axes[side];
    }

    getSeriesByType(type: string): SeriesOptions[] {
      if (!this.isValidSeriesType(type)) {
        throw new TypeError('Unknown series type: ' + type);
      }

      return this.series.filter((series) => series.type.indexOf(type) !== -1);
    }

    public static uuid(): string {
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
