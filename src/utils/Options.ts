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

    constructor(js:any = {}) {
      this.parse(js || Options.DEFAULT);
    }

    parse(js:any) {
      this.series = this.parseSeries(js.series || {});
      this.axes = this.parseAxes(js.axes || []);
    }

    parseSeries(jsSeries: any) {
      var series = Options.DEFAULT.series;

      angular.extend(series, jsSeries);

      return this.sanitizeSeries(series);
    }

    parseAxes(js: any) {
      var axes = Options.DEFAULT.axes;

       angular.extend(axes, js.axes);

      return this.sanitizeAxes(axes);
    }

    getByAxisSide(side: string) {
      if ([Factory.Axis.SIDE_X, Factory.Axis.SIDE_Y].indexOf(side) === -1) {
        throw new TypeError('Cannot get axis side : ' + side);
      }

      return this.axes[side];
    }

    getAbsKey(): string {
      if (!this.axes[Factory.Axis.SIDE_X]) {
        throw new TypeError('Cannot find abs key : ' + Factory.Axis.SIDE_X);
      }

      return this.axes[Factory.Axis.SIDE_X].key;
    }

    sanitizeSeries(series: any[]) {
      return (series || []).map((s) => new Series(s));
    }

    sanitizeAxes(axes: any) {
      // Map operation over an object, that returns a new object
      return Object.keys(axes || {}).reduce((prev, key) => {
        prev[key] = new AxisOptions(axes[key]);
        return prev;
      }, {});
    }

    _isValidSeriesType(type:string): Boolean {
      for (var key in Options.SERIES_TYPES) {
        if (Options.SERIES_TYPES[key] === type) {
          return true;
        }
      }

      return false;
    }

    getSeriesByType(type: string): Series[] {
      if (this._isValidSeriesType(type) === false) {
        throw new TypeError('Unknown series type: ' + type);
      }

      return this.series.filter((s) =>
        s.type.indexOf(type) > -1
      );
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
