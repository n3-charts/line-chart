module n3Charts.Options {
  'use strict';

  export interface IDot {
    pathRadius: number;
    tooltipRadius: number;
  }

  export class DotOptions {
    public dots:IDot = DotOptions.getDefaultDots();

    static getDefaultDots():IDot {
      return {
        pathRadius: 2,
        tooltipRadius: 3
      }
    }
  }
}