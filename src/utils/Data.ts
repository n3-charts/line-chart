module n3Charts.Utils {
  'use strict';

  export class Data {

    public sets: any;

    constructor(js: any) {
      if (js) {
        this.fromJS(js);
      }
    }

    fromJS(js: any) {
      for (var key in js) {
        if (js.hasOwnProperty(key)) {
          js[key] = new Dataset(js[key], key);
        }
      }

      this.sets = js;
    }

    getDatasets(series: ISeriesOptions[], options: Options): IPoint[][] {
      return series.map((d: ISeriesOptions) => this.getDatasetValues(d, options));
    }

    getDatasetValues(series: ISeriesOptions, options: Options): IPoint[] {
      if (!this.sets || !this.sets[series.dataset].values) {
        return [];
      }

      var xKey = options.getAbsKey();
      var fn: (d: any) => any;

      if (series.key.y0) {
        fn = (d: any) => {
          return { x: d[xKey], y1: d[series.key.y1], y0: d[series.key.y0] };
        };
      } else {
        fn = (d: any) => {
          return { x: d[xKey], y1: d[series.key.y1], y0: 0 };
        };
      }

      return this.sets[series.dataset].values.map(fn);
    }

    public static getMinDistance(data, scale, key = 'x', range?): number {

      return <number>d3.min(
        // Compute the minimum difference along an axis on all series
        data.map(series => {
          // Compute minimum delta
          return series
            // Look at all scaled values on the axis
            .map((d) => scale(d[key]))
            // Select only columns in the visible range
            .filter((d) => {
              return range ? d >= range[0] && d <= range[1] : true;
            })
            // Return the smallest difference between 2 values
            .reduce((prev, d, i, arr) => {
              // Get the difference from the current value
              // with the previous value in the array
              var diff = i > 0 ? d - arr[i - 1] : Number.MAX_VALUE;
              // Return the new difference if it is smaller
              // than the previous difference
              return diff < prev ? diff : prev;
            }, Number.MAX_VALUE);
        })
      );
    }
  }
}
