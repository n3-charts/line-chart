module n3Charts.Utils {
  'use strict';

  export class Options {

    static DEFAULT:any = {
      series: [],
      axes: {}
    };

    static SERIES_TYPES: any = {
      DOT: 'dot',
      LINE: 'line',
      AREA: 'area',
      COLUMN: 'column'
    };

    public series: Utils.Series[];
    public axes: any;

    constructor(js:any) {
      this.fromJS(js || Options.DEFAULT);
      this.sanitize();
    }

    fromJS(js:any) {
      this.series = js.series;
      this.axes = js.axes;
    }

    sanitize() {
      this.series = this._getSaneSeries(this.series);
      this.axes = this._getSaneAxes(this.axes);
    }

    getAbsKey(): string {
      if (this.axes.x) {
        return this.axes.x.key;
      }

      return undefined;
    }

    _getSaneSeries(series: any[]) {
      return (series || []).map((s) => { return new Utils.Series(s); });
    }

    _getSaneAxes(axes: any) {
      return axes || {};
    }

    _isValidSeriesType(type:string): Boolean {
      for (var key in Options.SERIES_TYPES) {
        if (Options.SERIES_TYPES[key] === type) {
          return true;
        }
      }

      return false;
    }

    getSeriesForType(type: string): Utils.Series[] {
      if (this._isValidSeriesType(type) === false) {
        throw new TypeError('Unknown series type: ' + type);
      }

      return this.series.filter((s) =>
        s.type.indexOf(type) > -1
      );
    }

    toJS() {
      return {
        series: this.series,
        axes: this.axes
      };
    }
  }
}
