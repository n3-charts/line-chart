module n3Charts.Utils {
  'use strict';

  export interface IAxisOptions {
    type: string;
    key: string;
    min?: any;
    max?: any;
  }

  export class AxisOptions implements IAxisOptions {
    public type: string = 'linear';
    public key: string = 'x';
    public min: any;
    public max: any;
    public tickFormat: (value: any, index?: number) => string;
    public ticks: any;

    public static SIDE = {
        X: 'x',
        Y: 'y',
        Y2: 'y2'
    };

    public static TYPE = {
      LINEAR: 'linear',
      DATE: 'date',
      LOG: 'log'
    };

    constructor(js: any = {}) {
      this.parse(js);
    }

    parse(js: any) {
      this.type = Options.getString(js.type, 'linear');
      this.key = js.key;
      this.tickFormat = Options.getFunction(js.tickFormat);
      this.ticks = js.ticks;

      if (this.type === AxisOptions.TYPE.LINEAR) {
        this.min = Options.getNumber(js.min, undefined);
        this.max = Options.getNumber(js.max, undefined);
      } else if (this.type === AxisOptions.TYPE.DATE) {
        this.min = Options.getDate(js.min, undefined);
        this.max = Options.getDate(js.max, undefined);
      }

    }

    static isValidSide(side: string): Boolean {
      return d3.values(AxisOptions.SIDE).indexOf(side) !== -1;
    }

    configure(axis: D3.Svg.Axis): D3.Svg.Axis {
      axis.tickFormat(this.tickFormat);
      if (this.ticks instanceof Array) {
        axis.tickValues(this.ticks);
      } else if (typeof this.ticks === 'number') {
        axis.ticks(this.ticks);
      }

      return axis;
    }
  }
}
