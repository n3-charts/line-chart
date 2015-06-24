module n3Charts.Factory {
  'use strict';

  export class Transition extends Utils.BaseFactory {

    private _transition: D3.Transition.Transition = d3.transition();

    pimp(what:string):Function {
      return {
        line: this._pimpLine,
        axis: this._pimpAxis
      }[what];
    }

    _pimpAxis(transition:D3.Transition.Transition):void {
      // Or whatever we want
      // transition.delay(500);
    }

    _pimpLine(transition:D3.Transition.Transition):void {
      // Or whatever we want
      // transition.delay(500);
    }
  }
}
