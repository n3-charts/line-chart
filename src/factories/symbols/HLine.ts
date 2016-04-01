module n3Charts.Factory.Symbols {
  'use strict';

  export class HLine extends Factory.Symbols.SymbolFactory {
    public type: string = Options.SymbolOptions.TYPE.HLINE;

    updateData(group: d3.selection.Update<Options.SymbolOptions>, symbol: Options.SymbolOptions) {

    }
  }
}
