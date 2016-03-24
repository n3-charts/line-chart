module n3Charts.Factory {
  'use strict';

  export class Pan extends Factory.BaseFactory {

    private isActive: Boolean = false;
    private hasMoved: Boolean = false;

    private panOnX: Boolean;
    private panOnY: Boolean;

    constrainOutgoingDomains(domains:Utils.IDomains):void {
      if (!this.panOnX) {
        delete domains.x;
      }

      if (!this.panOnY) {
        delete domains.y;
      }
    }

    move(deltaX:number, deltaY:number) {
      if (deltaX !== 0) {
        var x1 = this.factoryMgr.get('x-axis');
        var x2 = this.factoryMgr.get('x2-axis');

        x1.setDomain(x1.range().map((x) => x + deltaX).map(x1.invert, x1));
        x2.setDomain(x1.getDomain());
      }

      if (deltaY !== 0) {
        var y1 = this.factoryMgr.get('y-axis');
        var y2 = this.factoryMgr.get('y2-axis');

        y1.setDomain(y1.range().map((x) => x + deltaY).map(y1.invert, y1));
        y2.setDomain(y2.range().map((x) => x + deltaY).map(y2.invert, y2));
      }
    }

    update(data:Utils.Data, options:Options.Options) {
      this.panOnX = options.pan.x;
      this.panOnY = options.pan.y;

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
          let deltaX = this.panOnX ? xStart - xEnd : 0;
          let deltaY = this.panOnY ? yStart - yEnd : 0;

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
      };

      container.svg
        .on(k('mousedown'), () => {
          var event = <MouseEvent>d3.event;

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
