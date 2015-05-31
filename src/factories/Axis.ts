module n3Charts.Factory {
  'use strict';

  export class Axis extends Utils.BaseFactory {

    public svg: D3.Selection;
    public scale: D3.Scale.Scale;
    public axis: D3.Svg.Axis;

    constructor(public side: string) {
      super();

      if (['y', 'x'].indexOf(side) < 0) {
        throw new TypeError('Wrong axis side : ' + side);
      }
    }

    create() {
      // Get the svg container
      var vis: D3.Selection = this.factoryMgr.get('container').vis;

      this.createAxis(vis);
    }

    update(options, attributes: ng.IAttributes) {
      // Get the container dimensions
      var container = <Factory.Container> this.factoryMgr.get('container');
      var dim: IDimension = container.getDimensions();

      this.scale = this.getScale(dim);
      this.axis = this.getAxis();

      this.updateAxis(dim);
    }

    destroy() {
      this.destroyAxis();
    }

    createAxis(vis: D3.Selection) {
      // Create the axis container
      this.svg = vis
        .append('g')
          .attr('class', 'axis ' + this.side + '-axis');
    }

    updateAxis(dim: IDimension) {
      // Move the axis container to the correct position
      if (this.side === 'x') {
        this.svg
          .attr('transform', 'translate(0, ' + dim.innerHeight + ')');
      } else if (this.side === 'y') {
        this.svg
          .attr('transform', 'translate(0, 0)');
      }

      // Generate the Axis
      this.svg.call(this.axis);
    }

    destroyAxis() {
      // Remove the axis container
      this.svg.remove();
    }

    getScale(dim: IDimension): D3.Scale.Scale {
      // Create a d3.scale object
      var scale = d3.scale.linear();

      if (this.side === 'x') {
        scale.range([0, dim.innerWidth]);
      } else if (this.side === 'y') {
        scale.range([dim.innerHeight, 0]);
      }

      return scale;
    }

    getAxis(): D3.Svg.Axis {
      // Create a d3 axis generator
      var axis = d3.svg.axis()
        .scale(this.scale);

      if (this.side === 'x') {
        axis.orient('bottom');
      } else if (this.side === 'y') {
        axis.orient('left');
      }

      return axis;
    }
  }
}
