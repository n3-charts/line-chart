module n3Charts.Utils {
  'use strict';

  export class Options {

    static DEFAULT:any = {
      series: [],
      axes: {
        x: {},
        y: {}
      }
    };

    static SERIES_TYPES = {
      DOT: 'dot',
      LINE: 'line',
      AREA: 'area',
      COLUMN: 'column'
    };

    public series: Series[];
    public axes: any;

    constructor(js?:any) {
      this.parse(js);
    }

    parse(js?:any) {
      var options = Options.DEFAULT;

      angular.extend(options, js);

      this.series = this.parseSeries(options.series);
      this.axes = this.parseAxes(options.axes);
    }

    parseSeries(jsSeries: any) {
      // Type check because of <any> type
      if (!angular.isArray(jsSeries)) {
        throw TypeError('Series option must be an array.');
      }

      var series = Options.DEFAULT.series;

      // Extend the default series option
      angular.extend(series, jsSeries);

      return this.sanitizeSeries(series);
    }

    parseAxes(jsAxes: any) {
      // Type check because of <any> type
      if (!angular.isObject(jsAxes)) {
        throw TypeError('Axes option must be an object.');
      }

      var axes = Options.DEFAULT.axes;

      // Extend the default axes option
      angular.extend(axes, jsAxes);

      return this.sanitizeAxes(axes);
    }

    sanitizeSeries(rawSeries: any[]) {
      return (rawSeries).map((s) => new Series(s));
    }

    sanitizeAxes(rawAxes: any) {
      // Map operation over an object, that returns a new object
      return Object.keys(rawAxes).reduce((prev, key) => {
        prev[key] = new AxisOptions(rawAxes[key]);
        return prev;
      }, {});
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

    getSeriesByType(type: string): Series[] {
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
