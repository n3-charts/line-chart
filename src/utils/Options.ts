module n3Charts.Utils {
  'use strict';

  export class Options {
    public series: any[];
    public axes: any;

    constructor(js:any) {
      if (js) {
        this.fromJS(js);
      }
    }

    fromJS(js:any) {
      this.series = js.series;
      this.axes = js.axes;
    }
  }
}
