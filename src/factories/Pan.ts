module n3Charts.Factory {
  'use strict';

  export class Pan extends Factory.BaseFactory {

    private isActive: Boolean = false;
    private hasMoved: Boolean = false;

    private options: Options.IPanOptions;

    constrainDomains(domains:Utils.IDomains):void {
      domains.x = this.options.x(domains.x)
      domains.x2 = this.options.x2(domains.x2)
      domains.y = <number[]>this.options.y(domains.y)
      domains.y2 = <number[]>this.options.y2(domains.y2)
    }

    move(domains: Utils.IDomains) {
      let {x, x2, y, y2} = domains;

      var xAxis = <Factory.Axis>this.factoryMgr.get('x-axis');
      var x2Axis = <Factory.Axis>this.factoryMgr.get('x2-axis');
      var yAxis = <Factory.Axis>this.factoryMgr.get('y-axis');
      var y2Axis = <Factory.Axis>this.factoryMgr.get('y2-axis');

      if (x) {
        xAxis.setDomain(x);
      }

      if (x2) {
        x2Axis.setDomain(x2);
      }

      if (y) {
        yAxis.setDomain(y);
      }

      if (y2) {
        y2Axis.setDomain(y2);
      }
    }

    getNewDomains(deltaX:number, deltaX2:number, deltaY:number, deltaY2:number): Utils.IDomains {
      let xAxis = <Factory.Axis>this.factoryMgr.get('x-axis');
      let x2Axis = <Factory.Axis>this.factoryMgr.get('x2-axis');
      let yAxis = <Factory.Axis>this.factoryMgr.get('y-axis');
      let y2Axis = <Factory.Axis>this.factoryMgr.get('y2-axis');

      return {
        x: xAxis.range().map((x) => x + deltaX).map(xAxis.invert, xAxis),
        x2: x2Axis.range().map((x) => x + deltaX2).map(x2Axis.invert, xAxis),
        y: <number[]>yAxis.range().map((x) => x + deltaY).map(yAxis.invert, yAxis),
        y2: <number[]>y2Axis.range().map((x) => x + deltaY2).map(y2Axis.invert, y2Axis)
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
          let newDomains = this.getNewDomains(
            xStart - xEnd,
            xStart - xEnd,
            yStart - yEnd,
            yStart - yEnd
          );
          this.constrainDomains(newDomains);
          let {x, x2, y, y2} = newDomains;

          if (x || x2 || y || y2) {
            if (!turnBackOn) {
              turnBackOn = this.factoryMgr.turnFactoriesOff(['tooltip', 'transitions']);
            }

            this.hasMoved = true;
            this.move(newDomains);
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
