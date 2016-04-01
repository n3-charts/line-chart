module n3Charts.Options {
  'use strict';

  export class SymbolOptions {
    public type: string;
    public value: number | Date;
    public color: string;
    public axis: string;
    public id: string;

    static TYPE = {
      HLINE: 'hline',
      VLINE: 'vline',
    };

    constructor(js: any = {}) {
      this.parse(js);
    }

    parse(js: any) {
      if (!SymbolOptions.isValidType(js.type)) {
        throw new Error(`Unknown type for symbol: ${js.type}`);
      }

      this.type = Options.getString(js.type);
      this.value = Options.getNumber(js.value, 0);
      this.color = Options.getString(js.color, 'lightgrey');
      this.axis = Options.getString(js.axis, 'y');
      this.id = Options.getString(js.id, Utils.UUID.generate());
    }

    static isValidType(type: string) {
      return d3.values(SymbolOptions.TYPE).indexOf(type) !== -1;
    }
  }
}
