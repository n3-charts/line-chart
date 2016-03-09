module n3Charts.Factory {
  'use strict';

  export class Transition extends Factory.BaseFactory {
    static defaultDuration: number = 250;
    private duration: number = Transition.defaultDuration;
    private ease: string = 'cubic';

    off() {
      super.off();
      this.duration = 0;
    }

    on() {
      super.on();
      this.duration = Transition.defaultDuration;
    }

    enter(t: d3.Transition<any>) {
      var duration = this.duration;
      var ease = this.ease;
      var n = t[0].length;
      var delay = (d, i) => n ? i / n * duration : 0;

      t.duration(duration)
        .delay(delay)
        .ease(ease);
    }

    edit(t: d3.Transition<any>) {
      var duration = this.duration;
      var ease = this.ease;
      var delay = 0;

      t.duration(duration)
        .delay(delay)
        .ease(ease);
    }

    exit(t: d3.Transition<any>) {
      var duration = this.duration;
      var ease = this.ease;
      var delay = 0;

      t.duration(duration)
        .delay(delay)
        .ease(ease);
    }
  }
}
