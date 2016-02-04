module n3Charts.Factory {
  'use strict';

  export class Zoom extends Factory.BaseFactory {
    private isActive: Boolean = false;
    private rect:D3.Selection;

    private xStartFn:(x:number) => number;
    private xEndFn:(y:number) => number;

    private yStartFn:(y:number) => number;
    private yEndFn:(y:number) => number;


    create() {
      this.rect = this.factoryMgr.get('container').svg
        .append('rect')
          .attr('class', 'chart-brush');
    }

    update(data:Utils.Data, options:Options.Options) {
      this.registerEvents(this.factoryMgr.get('container'));

      let dimensions = (<Factory.Container>this.factoryMgr.get('container')).getDimensions();
      let {left, top} = dimensions.margin;

      this.xStartFn = options.zoom.x ? (x) => x : (x) => left;
      this.xEndFn = options.zoom.x ? (x) => x : (x) => dimensions.innerWidth + left;

      this.yStartFn = options.zoom.y ? (y) => y : (y) => top;
      this.yEndFn = options.zoom.y ? (y) => y : (y) => dimensions.innerHeight + top;
    }

    show({xStart, xEnd, yStart, yEnd}:{xStart: number, xEnd: number, yStart: number, yEnd: number}) {
      [xStart, xEnd] = xStart > xEnd ? [xEnd, xStart] : [xStart, xEnd];
      [yStart, yEnd] = yStart > yEnd ? [yEnd, yStart] : [yStart, yEnd];

      this.rect.attr({
        x: xStart,
        width: xEnd - xStart,
        y: yStart,
        height: yEnd - yStart
      }).style('opacity', '1');
    }

    hide() {
      this.rect.style('opacity', '0');
    }

    updateAxes({xStart, xEnd, yStart, yEnd}:{xStart: number, xEnd: number, yStart: number, yEnd: number}) {
      console.log(xStart, xEnd);
      [xStart, xEnd] = xStart > xEnd ? [xEnd, xStart] : [xStart, xEnd];
      [yStart, yEnd] = yStart > yEnd ? [yEnd, yStart] : [yStart, yEnd];

      let dimensions = (<Factory.Container>this.factoryMgr.get('container')).getDimensions();
      let {left, top} = dimensions.margin;

      let xAxis:Factory.Axis = this.factoryMgr.get('x-axis');
      let x2Axis:Factory.Axis = this.factoryMgr.get('x2-axis');
      xAxis.scale.domain([xAxis.invert(xStart - left), xAxis.invert(xEnd - left)]);
      x2Axis.scale.domain(xAxis.scale.domain());

      let yAxis:Factory.Axis = this.factoryMgr.get('y-axis');
      let y2Axis:Factory.Axis = this.factoryMgr.get('y2-axis');
      yAxis.scale.domain([yAxis.invert(yEnd - top), yAxis.invert(yStart - top)]);
      y2Axis.scale.domain(yAxis.scale.domain());
    }

    registerEvents(container: Factory.Container) {
      let k = (event) => `${event}.${this.key}`;
      let xStart;
      let xEnd;
      let yStart;
      let yEnd;

      let turnBackOn;
      let onMouseUp = () => {
        this.isActive = false;
        this.hide();

        if (xEnd !== undefined && yEnd !== undefined) {
          this.updateAxes({xStart, xEnd, yStart, yEnd});
          this.eventMgr.trigger('zoom-end');

          xStart = xEnd = yStart = yEnd = undefined;
          turnBackOn();
        }

        this.eventMgr.on(k('window-mouseup'), null);
      };

      container.svg
        .on(k('mousedown'), () => {
          if (d3.event.altKey) {
            turnBackOn = this.factoryMgr.turnFactoriesOff(['tooltip']);
            this.isActive = true;
            this.eventMgr.on(k('window-mouseup'), onMouseUp);

            [xStart, yStart] = d3.mouse(d3.event.currentTarget);
            xStart = this.xStartFn(xStart);
            yStart = this.yStartFn(yStart);
          }
        }).on(k('mousemove'), () => {
          if (this.isActive) {
            [xEnd, yEnd] = d3.mouse(d3.event.currentTarget);
            xEnd = this.xEndFn(xEnd);
            yEnd = this.yEndFn(yEnd);

            this.show({xStart, xEnd, yStart, yEnd});
            this.eventMgr.trigger('zoom');
          }
        });
    }
  }
}
