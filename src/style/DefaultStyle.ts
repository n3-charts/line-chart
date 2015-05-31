module n3Charts.Style {
  'use strict';

  export class DefaultStyle extends Utils.BaseFactory {

    private styleAxis(axis:Factory.Axis) {
      axis.svg.style({
        'font': '10px Courier',
        'shape-rendering': 'crispEdges'
      }).selectAll('path').style({
        'fill': 'none',
        'stroke': '#000'
      });
    }

    private unStyleAxis(axis:Factory.Axis) {
      axis.svg.style({
        'font': undefined,
        'shape-rendering': undefined
      }).selectAll('path').style({
        'fill': undefined,
        'stroke': undefined
      });
    }

    update() {
      this.styleAxis(this.factoryMgr.get('x-axis'));
      this.styleAxis(this.factoryMgr.get('y-axis'));
    }

    destroy() {
      this.unStyleAxis(this.factoryMgr.get('x-axis'));
      this.unStyleAxis(this.factoryMgr.get('y-axis'));
    }
  }
}
