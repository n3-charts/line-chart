import * as d3 from 'd3';

import { BaseFactory } from './BaseFactory';

export class Transition extends BaseFactory {
  static defaultDuration = 250;
  private duration = Transition.defaultDuration;
  private ease = d3.easeCubicInOut;

  off() {
    super.off();
    this.duration = 0;
  }

  on() {
    super.on();
    this.duration = Transition.defaultDuration;
  }

  enter(t: d3.Transition<any, any, any, any>) {
    var duration = this.duration;
    var ease = this.ease;
    var n = (t as any)._groups[0].length;
    var delay = (d, i) => n ? i / n * duration : 0;

    t.duration(duration)
      .delay(delay)
      .ease(ease);
  }

  edit(t: d3.Transition<any, any, any, any>) {
    var duration = this.duration;
    var ease = this.ease;
    var delay = 0;

    t.duration(duration)
      .delay(delay)
      .ease(ease);
  }

  exit(t: d3.Transition<any, any, any, any>) {
    var duration = this.duration;
    var ease = this.ease;
    var delay = 0;

    t.duration(duration)
      .delay(delay)
      .ease(ease);
  }
}
