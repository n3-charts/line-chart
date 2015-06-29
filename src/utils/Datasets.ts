module n3Charts.Utils {
  'use strict';

  export class Datasets {
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

    getValuesForSeries(series: OptionsSeries[], options:Options): {} {
      var setsForSeries = {};
      var absKey = options.getAbsKey();

      series.forEach((s) => {
        var set: Dataset = this.sets[s.dataset];

        setsForSeries[s.id] = set.values.map((datum) => {
          return { x: datum[absKey], y: datum[s.key] };
        });
      });

      return setsForSeries;
    }
  }
}
