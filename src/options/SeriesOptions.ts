module n3Charts.Options {
  'use strict';

  export interface ISeriesOptions {
    axis: string;
    dataset: string;
    key: {y0?: string, y1: string};
    label: string;
    type: string[];
    id: string;
    defined: (point: Utils.IPoint) => boolean;
    color: string;
    visible: boolean;
    interpolation: {tension: number, mode: string};
    hasType: (type: string) => boolean;
  }

  export class SeriesOptions implements ISeriesOptions {
    public axis: string = 'y';
    public interpolation: {tension: number, mode: string};
    public dataset: string;
    public key: { y0?: string, y1: string };
    public label: string;
    public type: string[] = ['line'];
    public id: string;
    public color: string;
    public visible: boolean = true;
    public defined = (v: Utils.IPoint) => true;

    static TYPE = {
      DOT: 'dot',
      LINE: 'line',
      DASHED_LINE: 'dashed-line',
      AREA: 'area',
      COLUMN: 'column'
    };

    constructor(js: any = {}) {
      var options = this.sanitizeOptions(js);

      this.id = options.id || Utils.UUID.generate();
      this.axis = options.axis;
      this.interpolation = options.interpolation;
      this.dataset = options.dataset;
      this.key = options.key;
      this.color = options.color;
      this.visible = options.visible;
      this.label = options.label || options.id;

      if (options.defined) {
        this.defined = options.defined;
      }

      if (options.type.length > 0) {
        this.type = this.sanitizeType(options.type);
      }
    }

    /**
     * Make sure that the options have proper types,
     * and convert raw js to typed variables
     */
    sanitizeOptions(js: any) {
      var options = Utils.ObjectUtils.extend(this, js);

      options.axis = this.sanitizeAxis(options.axis);
      options.interpolation = this.sanitizeInterpolation(options.interpolation);
      options.id = Options.getString(options.id);
      options.type = Options.getArray(options.type);
      options.dataset = Options.getString(options.dataset);
      options.key = this.sanitizeKeys(options.key);
      options.color = Options.getString(options.color);
      options.label = Options.getString(options.label);
      options.visible = Options.getBoolean(options.visible);
      options.defined = Options.getFunction(options.defined);

      return options;
    }

    sanitizeInterpolation(js: any): {tension: number, mode: string} {
      if (!js) {
        return {mode: 'linear', tension: 0.7};
      }

      return {
        mode: Options.getString(js.mode, 'linear'),
        tension: Options.getNumber(js.tension, 0.7)
      };
    }

    sanitizeKeys(js: any): { y0?: string, y1: string } {
      if (!js) {
        return { y1: undefined };
      }

      if (typeof js === 'string') {
        return {y1: Options.getString(js)};
      }

      return {
        y0: Options.getString(js.y0),
        y1: Options.getString(js.y1)
      };
    }

    /**
     * Return the toggeled visibility without modifying
     * the visibility property itself
     */
    getToggledVisibility() {
      return !this.visible;
    }

    /**
     * Return an array of valid types
     */
    sanitizeType(types: string[]) {
      return types.filter((type) => {
        if (!SeriesOptions.isValidType(type)) {
          console.warn('Unknow series type : ' + type);
          return false;
        }

        return true;
      });
    }

    /**
     * Return a valid axis key
     */
    sanitizeAxis(axis: string) {
      if (['y', 'y2'].indexOf(axis) === -1) {
        throw TypeError(axis + ' is not a valid series option for axis.');
      }

      return axis;
    }

    /**
     * Returns true if the series has a type column.
     * Series of type column need special treatment,
     * because x values are usually offset
     */
    isAColumn() {
      return this.hasType(SeriesOptions.TYPE.COLUMN);
    }

    isDashed() {
      return this.type.indexOf(SeriesOptions.TYPE.DASHED_LINE) !== -1;
    }

    /**
     * Returns true if the series has a type *type*,
     * where type should be a value of SeriesOptions.TYPE
     */
    hasType(type: string) {
      if (type === SeriesOptions.TYPE.LINE) {
        return (this.type.indexOf(type) !== -1 || this.type.indexOf(SeriesOptions.TYPE.DASHED_LINE) !== -1);
      }

      return this.type.indexOf(type) !== -1;
    }

    hasTwoKeys():boolean {
      return this.key.y0 !== undefined;
    }

    /**
     * Returns true if the type *type* is a valid type
     */
    static isValidType(type: string) {
      return d3.values(SeriesOptions.TYPE).indexOf(type) !== -1;
    }
  }
}
