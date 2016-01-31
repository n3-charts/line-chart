module n3Charts.Factory {
  'use strict';

  export class Transition extends Factory.BaseFactory {
    static defaultDuration: number = 250;
    static duration: number = Transition.defaultDuration;
    static ease: string = 'cubic';
    static enabled: Boolean = true;

    off() {
      Transition.duration = 0;
    }

    on() {
      Transition.duration = Transition.defaultDuration;
    }

    enter(t: D3.Transition.Transition) {
      var duration = Transition.duration;
      var ease = Transition.ease;
      var n = t[0].length;
      var delay = (d, i) => n ? i / n * duration : 0;

      t.duration(duration)
        .delay(delay)
        .ease(ease);
    }

    edit(t: D3.Transition.Transition) {
      var duration = Transition.duration;
      var ease = Transition.ease;
      var delay = 0;

      t.duration(duration)
        .delay(delay)
        .ease(ease);
    }

    exit(t: D3.Transition.Transition) {
      var duration = Transition.duration;
      var ease = Transition.ease;
      var delay = 0;

      t.duration(duration)
        .delay(delay)
        .ease(ease);
    }
  }
}
