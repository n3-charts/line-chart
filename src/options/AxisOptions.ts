module n3Charts.Options {
  'use strict';

  export class AxisOptions {
    public includeZero: Boolean = false;
    public type: string = 'linear';
    public key: string = 'x';
    public min: any;
    public max: any;
    public tickFormat: (value: any, index?: number) => string;
    public ticks: any;
    public padding = {min: 0, max: 0};
    public ticksShift: any = {
      x: 0,
      y: 0
    };

    public static SIDE = {
      X: 'x',
      X2: 'x2',
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
      this.padding = <{min: number, max: number}>Options.getObject(js.padding || {}, this.padding);
      this.includeZero = Options.getBoolean(js.includeZero, false);
      this.tickFormat = Options.getFunction(js.tickFormat);
      this.ticks = js.ticks;

      if (js.ticksShift) {
        this.ticksShift = {
          x: Options.getNumber(js.ticksShift.x, 0),
          y: Options.getNumber(js.ticksShift.y, 0)
        };
      }

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

    hasDynamicTicks() {
      return this.ticks instanceof Function;
    }

    configure(axis: d3.svg.Axis): d3.svg.Axis {
      axis.tickFormat(this.tickFormat);

      if (this.ticks instanceof Array) {
        axis.tickValues(this.ticks);
      } else if (typeof this.ticks === 'number') {
        axis.ticks(this.ticks);
      } else if (this.ticks instanceof Function) {
        axis.ticks(this.ticks);
      }

      return axis;
    }
  }
}
