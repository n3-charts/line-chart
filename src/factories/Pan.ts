module n3Charts.Factory {
  'use strict';

  export class Pan extends Factory.BaseFactory {

    private isActive: Boolean = false;
    private hasMoved: Boolean = false;
    private xFn:(x:number) => number;
    private yFn:(y:number) => number;

    move(deltaX:number, deltaY:number) {
      if (deltaX !== 0) {
        var x1 = this.factoryMgr.get('x-axis').scale;
        var x2 = this.factoryMgr.get('x2-axis').scale;

        x1.domain(x1.range().map((x) => x + deltaX).map(x1.invert));
        x2.domain(x1.domain());
      }

      if (deltaY !== 0) {
        var y1 = this.factoryMgr.get('y-axis').scale;
        var y2 = this.factoryMgr.get('y2-axis').scale;

        y1.domain(y1.range().map((x) => x + deltaY).map(y1.invert));
        y2.domain(y1.domain());
      }
    }

    update(data:Utils.Data, options:Options.Options) {
      this.xFn = options.pan.x ? (x) => x : (x) => 0;
      this.yFn = options.pan.y ? (y) => y : (y) => 0;

      let container = this.factoryMgr.get('container');
      let k = (event) => `${event}.${this.key}`;
      let xStart;
      let yStart;
      let turnBackOn;

      let onMouseUp = () => {
        if (this.hasMoved) {
          this.eventMgr.trigger('pan-end');
        }

        if (turnBackOn) {
          turnBackOn();
        }

        this.isActive = this.hasMoved = false;
        turnBackOn = undefined;
        this.eventMgr.on(k('window-mouseup'), null);
      };

      container.svg
        .on(k('mousedown'), () => {
          if (!d3.event.altKey) {
            this.isActive = true;
            [xStart, yStart] = d3.mouse(d3.event.currentTarget);
            this.eventMgr.on(k('window-mouseup'), onMouseUp);
          }
        }).on(k('mousemove'), () => {
          if (this.isActive) {
            let [xEnd, yEnd] = d3.mouse(d3.event.currentTarget);
            let deltaX = this.xFn(xStart - xEnd);
            let deltaY = this.yFn(yStart - yEnd);

            if (deltaX !== 0 || deltaY !== 0) {
              if (!turnBackOn) {
                turnBackOn = this.factoryMgr.turnFactoriesOff(['tooltip', 'transitions']);
              }

              this.hasMoved = true;
              this.move(deltaX, deltaY);
              this.eventMgr.trigger('pan');
            }

            [xStart, yStart] = [xEnd, yEnd];
          }
        });
    }
  }
}
