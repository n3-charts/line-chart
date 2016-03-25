module n3Charts.Options {
  'use strict';

  export interface IMargin {
    top: number;
    left: number;
    bottom: number;
    right: number;
  }

  export class Dimensions {
    public width = 600;
    public height = 200;
    public innerWidth = 560;
    public innerHeight = 160;

    public margin:IMargin = Dimensions.getDefaultMargins();

    static getDefaultMargins():IMargin {
      return  {
        top: 0,
        left: 40,
        bottom: 40,
        right: 40
      };
    }

    updateMargins(options: Options) {
      if (!options || !options.margin) {
        return;
      }

      var fn = (prop) => this.margin[prop] = Options.getNumber(options.margin[prop], this.margin[prop]);

      fn('top');
      fn('bottom');
      fn('left');
      fn('right');
    }

    getDimensionByProperty(element: HTMLElement, propertyName: string) {
      var style = window.getComputedStyle(element, null);
      return +style.getPropertyValue(propertyName).replace(/px$/, '');
    }

    fromParentElement(parent: HTMLElement) {
      if (!parent) {
        return;
      }

      // Oooooh I hate doing this.
      var hPadding = this.getDimensionByProperty(parent, 'padding-left') + this.getDimensionByProperty(parent, 'padding-right');
      var vPadding = this.getDimensionByProperty(parent, 'padding-top') + this.getDimensionByProperty(parent, 'padding-bottom');

      this.width = parent.clientWidth - hPadding;
      this.height = parent.clientHeight - vPadding;

      this.innerHeight = this.height - this.margin.top - this.margin.bottom;
      this.innerWidth = this.width - this.margin.left - this.margin.right;
    }
  }
}
