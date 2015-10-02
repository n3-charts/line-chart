module n3Charts.Utils {
  'use strict';

  export interface ISeriesOptions {
    axis: string;
    dataset: string;
    key: string;
    label: string;
    type: string[];
    id: string;
    color: string;
    visible: boolean;
  }

  export class SeriesOptions implements ISeriesOptions {
    public axis: string = 'y';
    public dataset: string;
    public key: string;
    public label: string;
    public type: string[] = ['line'];
    public id: string;
    public color: string;
    public visible: boolean = true;

    static TYPE = {
        DOT: 'dot',
        LINE: 'line',
        AREA: 'area',
        COLUMN: 'column'
    };

    constructor(js: any = {}) {
      var options = this.sanitizeOptions(js);

      this.id = options.id || Options.uuid();
      this.axis = this.sanitizeAxis(options.axis);
      this.dataset = options.dataset;
      this.key = options.key;
      this.color = options.color;
      this.visible = options.visible;
      this.label = options.label || options.id;

      if (options.type.length > 0) {
        this.type = this.sanitizeType(options.type);
      }
    }

    /**
     * Make sure that the options have proper types,
     * and convert raw js to typed variables
     */
    sanitizeOptions(js: any) {
      var options = <ISeriesOptions>{};

      // Extend the default options
      angular.extend(options, this, js);

      options.id = Options.getString(options.id);
      options.type = Options.getArray(options.type);
      options.dataset = Options.getString(options.dataset);
      options.key = Options.getString(options.key);
      options.color = Options.getString(options.color);
      options.label = Options.getString(options.label);
      options.visible = Options.getBoolean(options.visible);

      return options;
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
        return SeriesOptions.isValidType(type);
      });
    }

    /**
     * Return a valid axis key
     */
    sanitizeAxis(axis: string) {
      if (['y'].indexOf(axis) === -1) {
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

    /**
     * Returns true if the series has a type *type*,
     * where type should be a value of SeriesOptions.TYPE
     */
    hasType(type: string) {
      return this.type.indexOf(type) !== -1;
    }

    /**
     * Returns true if the type *type* is a valid type
     */
    static isValidType(type: string) {
      return d3.values(SeriesOptions.TYPE).indexOf(type) !== -1;
    }
  }
}
