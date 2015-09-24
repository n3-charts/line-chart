module n3Charts.Utils {
  'use strict';

  export class AxisOptions {

    public type: string = 'linear';
    public key: string = 'x';

    public static TYPE = {
      LINEAR: 'linear',
      DATE: 'date'
    };

    constructor(js: any) {
      this.parseJS(js);
    }

    parseJS(js: any) {
      this.type = js.type;
      this.key = js.key;
    }
  }
}