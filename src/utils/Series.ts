module n3Charts.Utils {
  'use strict';

  export class Series {
    public axis: string = 'y';
    public dataset: string;
    public key: string;
    public type: string[] = ['line'];
    public id: string;
    public color: string;

    constructor(js: any) {
      if (js) {
        js = this.sanitize(js);
        this.fromJS(js);
      }
    }

    fromJS(js: any) {
      this.axis = js.axis;
      this.dataset = js.dataset;
      this.key = js.key;
      this.type = this.parseType(js.type);
      this.id = js.id;
      this.color = js.color;
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

    toJS() {
      return {
        axis: this.axis,
        dataset: this.dataset,
        key: this.key,
        type: this.type,
        id: this.id,
        color: this.color
      };
    }
  }
}
