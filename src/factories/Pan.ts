module n3Charts.Factory {
  'use strict';

  export class Pan extends Factory.BaseFactory {

    private isActive: Boolean = false;
    private hasMoved: Boolean = false;

    private options: Options.IPanOptions;

    constrainOutgoingDomains(domains:Utils.IDomains):void {
      if (!this.options.x) {
        delete domains.x;
      }

      if (!this.options.x2) {
        delete domains.x2;
      }

      if (!this.options.y) {
        delete domains.y;
      }

      if (!this.options.y2) {
        delete domains.y2;
      }
    }

    move(deltaX:number, deltaX2:number, deltaY:number, deltaY2:number) {
      if (deltaX !== 0 || deltaX2 !== 0) {
        var x = this.factoryMgr.get('x-axis');
        var x2 = this.factoryMgr.get('x2-axis');

        x.setDomain(x.range().map((x) => x + deltaX).map(x.invert, x));
        x2.setDomain(x.getDomain());
      }

      if (deltaY !== 0) {
        var y = this.factoryMgr.get('y-axis');
        y.setDomain(y.range().map((x) => x + deltaY).map(y.invert, y));
      }

      if (deltaY2 !== 0) {
        var y2 = this.factoryMgr.get('y2-axis');
        y2.setDomain(y2.range().map((x) => x + deltaY2).map(y2.invert, y2));
      }
    }

    update(data:Utils.Data, options:Options.Options) {
      this.options = options.pan;

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
        this.eventMgr.on(k('window-mousemove'), null);
      };

      let onMouseMove = () => {
        if (this.isActive) {
          let [xEnd, yEnd] = d3.mouse(container.svg.node());
          let deltaX = this.options.x ? xStart - xEnd : 0;
          let deltaX2 = this.options.x2 ? xStart - xEnd : 0;
          let deltaY = this.options.y ? yStart - yEnd : 0;
          let deltaY2 = this.options.y2 ? yStart - yEnd : 0;

          if (deltaX !== 0 || deltaY !== 0 || deltaX2 !== 0 || deltaY2 !== 0) {
            if (!turnBackOn) {
              turnBackOn = this.factoryMgr.turnFactoriesOff(['tooltip', 'transitions']);
            }

            this.hasMoved = true;
            this.move(deltaX, deltaX2, deltaY, deltaY2);
            this.eventMgr.trigger('pan');
          }

          [xStart, yStart] = [xEnd, yEnd];
        }
      };

      container.svg
        .on(k('mousedown'), () => {
          var event = <MouseEvent>d3.event;

          // We don't want to process non-left click events
          if (event.button !== 0) {
            return;
          }

          if (!event.altKey) {
            this.isActive = true;
            [xStart, yStart] = d3.mouse(event.currentTarget);
            this.eventMgr.on(k('window-mouseup'), onMouseUp);
            this.eventMgr.on(k('window-mousemove'), onMouseMove);
          }
        });
    }
  }
}
