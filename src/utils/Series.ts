module n3Charts.Utils {
  'use strict';

  export class Series {
    public axis: string = 'y';
    public dataset: string;
    public key: string;
    public label: string;
    public type: string[] = ['line'];
    public id: string;
    public color: string;
    public visible = true;

    constructor(js: any) {
      if (js) {
        this.parseJS(this.sanitize(js));
      }
    }

    parseJS(js: any) {
      this.axis = js.axis;
      this.dataset = js.dataset;
      this.key = js.key;
      this.type = this.parseType(js.type);
      this.id = js.id;
      this.color = js.color;
      this.visible = !(js.visible === false);
      this.label = js.label || js.id;
    }

    getToggledVisibility() {
      return !this.visible;
    }

    parseType(js:any): string[] {
      if (!js) {
        return ['line'];
      }

      if (typeof js === 'string') {
        return [js];
      }

      return js;
    }

    sanitize(js:any) {
      if (!js.id) {
        throw new TypeError('Every series must have an id property');
      }

      return js;
    }

    isAColumn() {
      return this.type.indexOf(Utils.Options.SERIES_TYPES.COLUMN) > -1;
    }

    getMainType() {
      if (this.type.length === 1) {
        return this.type[0];
      }

      var types = Utils.Options.SERIES_TYPES;

      if (this.type.indexOf(types.AREA) !== -1) {
        return types.AREA;
      }

      if (this.type.indexOf(types.LINE) !== -1) {
        return types.LINE;
      }

      if (this.type.indexOf(types.DOT) !== -1) {
        return types.DOT;
      }

      return this.type[0];
    }
  }
}
