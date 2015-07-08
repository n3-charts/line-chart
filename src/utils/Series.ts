module n3Charts.Utils {
  'use strict';

  export class Series {
    public axis: string = 'y';
    public dataset: string;
    public key: string;
    public types: string[] = ['line'];
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
      this.types = this.parseType(js.type);
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

    toJS() {
      return {
        axis: this.axis,
        dataset: this.dataset,
        key: this.key,
        types: this.types,
        id: this.id,
        color: this.color
      };
    }
  }
}
