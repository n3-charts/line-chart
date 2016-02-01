module n3Charts.Factory {
  'use strict';

  export class Transition extends Factory.BaseFactory {
    static defaultDuration: number = 250;
    private duration: number = Transition.defaultDuration;
    private ease: string = 'cubic';

    isEnabled():Boolean {
      return this.duration > 0;
    }

    off() {
      this.duration = 0;
    }

    on() {
      this.duration = Transition.defaultDuration;
    }

    enter(t: D3.Transition.Transition) {
      var duration = this.duration;
      var ease = this.ease;
      var n = t[0].length;
      var delay = (d, i) => n ? i / n * duration : 0;

      t.duration(duration)
        .delay(delay)
        .ease(ease);
    }

    edit(t: D3.Transition.Transition) {
      var duration = this.duration;
      var ease = this.ease;
      var delay = 0;

      t.duration(duration)
        .delay(delay)
        .ease(ease);
    }

    exit(t: D3.Transition.Transition) {
      var duration = this.duration;
      var ease = this.ease;
      var delay = 0;

      t.duration(duration)
        .delay(delay)
        .ease(ease);
    }
  }
}
