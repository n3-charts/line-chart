module n3Charts.Factory {
  'use strict';

  export class Transition extends Utils.BaseFactory {

    static duration: number = 250;
    static ease: string = 'cubic';

    enter(t: D3.Transition.Transition) {
      var duration = Transition.duration;
      var ease = Transition.ease;
      var n = t[0].length;
      var delay = (d, i) => n ? i / n * duration : 0;

      return t.duration(duration)
        .delay(delay)
        .ease(ease);
    }

    edit(t: D3.Transition.Transition) {
      var duration = Transition.duration;
      var ease = Transition.ease;
      var delay = 0;

      return t.duration(duration)
        .delay(delay)
        .ease(ease);
    }

    exit(t: D3.Transition.Transition) {
      var duration = Transition.duration;
      var ease = Transition.ease;
      var delay = 0;

      return t.duration(duration)
        .delay(delay)
        .ease(ease);
    }
  }
}
