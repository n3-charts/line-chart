module n3Charts.Utils {
  'use strict';

  export class Dataset {
    public data: Object[];
    public key: string;

    constructor(js:any) {
      if (js) {
        this.fromJS(js);
      }
    }

    fromJS(js:any) {
      this.key = js.key;
      this.data = js.data;
    }
  }
}
