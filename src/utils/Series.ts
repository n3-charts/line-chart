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

    constructor(js: any = {}) {
      this.parse(js);
    }

    parse(jsSeries: any) {
      this.id = jsSeries.id || Options.uuid();
      this.axis = jsSeries.axis;
      this.dataset = jsSeries.dataset;
      this.key = jsSeries.key;
      this.type = this.parseType(jsSeries.type);
      this.id = jsSeries.id;
      this.color = jsSeries.color;
      this.visible = !(jsSeries.visible === false);
      this.label = jsSeries.label || jsSeries.id;
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
