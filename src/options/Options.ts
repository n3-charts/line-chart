module n3Charts.Options {
  'use strict';

  export interface IAxesSet {
    x: AxisOptions;
    y: AxisOptions;
    y2?: AxisOptions;
  };

  export interface ITwoAxes {
    x: boolean;
    y: boolean;
  }

  export interface IPanOptions {
    x: boolean;
    x2: boolean;
    y: boolean;
    y2: boolean;
  }

  export class Options {

    public doubleClickEnabled = true;

    public tooltipHook: Function;

    public series: ISeriesOptions[] = [];

    public symbols: SymbolOptions[] = [];

    public pan: IPanOptions = {
      x: false,
      x2: false,
      y: false,
      y2: false
    };

    public zoom: ITwoAxes = {
      x: false,
      y: false
    };

    public axes: IAxesSet = {
      x: <AxisOptions>{},
      y: <AxisOptions>{}
    };

    public margin: IMargin = Dimensions.getDefaultMargins();

    public grid: ITwoAxes = {
      x: false,
      y: true
    };

    constructor(js?:any) {
      var options = <any>_.assign({}, this, js); //angular.extend({}, this, js);

      this.margin = this.sanitizeMargin(Options.getObject(options.margin, this.margin));
      this.series = this.sanitizeSeries(Options.getArray(options.series));
      this.symbols = this.sanitizeSymbols(Options.getArray(options.symbols));
      this.axes = this.sanitizeAxes(Options.getObject(options.axes, this.axes));
      this.grid = this.sanitizeTwoAxesOptions(options.grid, this.grid);
      this.pan = this.sanitizePanOptions(options.pan, this.pan);
      this.zoom = this.sanitizeTwoAxesOptions(options.zoom, this.zoom);
      this.tooltipHook = Options.getFunction(options.tooltipHook);
      this.doubleClickEnabled = Options.getBoolean(options.doubleClickEnabled, false);
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

    sanitizeSymbols(symbols: any[]): SymbolOptions[]  {
      return (symbols).map((s) => new SymbolOptions(s));
    }

    sanitizeTwoAxesOptions(object: any, def: any): ITwoAxes {
      return {
        x: Options.getBoolean(object.x, def.x),
        y: Options.getBoolean(object.y, def.y)
      };
    }

    sanitizePanOptions(object: any, def: any): IPanOptions {
      return {
        x: Options.getBoolean(object.x, def.x),
        x2: Options.getBoolean(object.x2, def.x2),
        y: Options.getBoolean(object.y, def.y),
        y2: Options.getBoolean(object.y2, def.y2)
      };
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

    getVisibleDatasets(): string[] {
      var datasets = [];

      this.series.forEach((series) => {
        if (series.visible) {
          if (datasets.indexOf(series.dataset) === -1) {
            datasets.push(series.dataset);
          }
        }
      });

      return datasets;
    }

    getVisibleSeriesBySide(side: string): ISeriesOptions[] {
      return this.series.filter(s => s.visible && s.axis === side);
    }

    getSeriesAndDatasetBySide(side: string): {seriesForDataset: {}, datasetsForSide: string[]} {
      if (!AxisOptions.isValidSide(side)) {
        throw new TypeError('Cannot get axis side : ' + side);
      }

      if (side === AxisOptions.SIDE.Y2 && !this.axes[side]) {
        side = AxisOptions.SIDE.Y;
      }

      var datasetsForSide = [];
      var seriesForDataset = {};

      this.series.forEach((series) => {
        if (series.visible && series.axis === side) {
          datasetsForSide.push(series.dataset);
          if (!seriesForDataset[series.dataset]) {
            seriesForDataset[series.dataset] = [];
          }
          seriesForDataset[series.dataset].push(series);
        }
      });

      return {seriesForDataset, datasetsForSide};
    }

    getByAxisSide(side: string): AxisOptions {
      if (!AxisOptions.isValidSide(side)) {
        throw new TypeError('Cannot get axis side : ' + side);
      }

      if (!this.axes[side]) {
        if (side === AxisOptions.SIDE.Y2) {
          return this.axes[AxisOptions.SIDE.Y];
        } else if (side === AxisOptions.SIDE.X2) {
          return this.axes[AxisOptions.SIDE.X];
        }
      }

      return this.axes[side];
    }

    getSeriesByType(type: string): ISeriesOptions[] {
      if (!SeriesOptions.isValidType(type)) {
        throw new TypeError('Unknown series type: ' + type);
      }

      return this.series.filter((s) => s.hasType(type));
    }

    getSymbolsByType(type: string): SymbolOptions[] {
      if (!SymbolOptions.isValidType(type)) {
        throw new TypeError('Unknown symbols type: ' + type);
      }

      return this.symbols.filter((s) => s.type === type);
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
      if (!_.isObject(value)) {
        throw TypeError(value + ' option must be an object.');
      }

      return _.assign({}, defaultValue, value);
    }

    static getArray(value: any|any[], defaultValue: any[] = []) {
      return defaultValue.concat(value);
    }
  }
}
