module n3Charts.Utils {
  'use strict';

  export interface IAxisOptions {
    type: string;
    key: string;
  }

  export class AxisOptions implements IAxisOptions {

    public type: string = 'linear';
    public key: string = 'x';

    public static SIDE = {
        X: 'x',
        Y: 'y'
    };

    public static TYPE = {
      LINEAR: 'linear',
      DATE: 'date'
    };

    constructor(js: any = {}) {
      this.parse(js);
    }

    parse(js: any) {
      this.type = js.type;
      this.key = js.key;
    }

    static isValidSide(side: string): Boolean {
      return d3.values(AxisOptions.SIDE).indexOf(side) !== -1;
    }
  }
}