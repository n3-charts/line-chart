module n3Charts.Utils {
  'use strict';

  export class OptionsSeries {
    public axis: string = 'y';
    public dataset: string = undefined;
    public key: string = undefined;
    public type: string = 'line';
    public id: string = undefined;
    public color: string = undefined;


    static isValidType(type: string): Boolean {
      return ['line', 'area', 'column'].indexOf(type) > -1;
    }

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
      this.type = js.type;
      this.id = js.id;
      this.color = js.color;
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
        type: this.type,
        id: this.id,
        color: this.color
      };
    }
  }
}
