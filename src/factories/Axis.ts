module n3Charts.Factory {
  'use strict';

  export class Axis extends Utils.BaseFactory {

    public svg: D3.Selection;
    public scale: D3.Scale.Scale;
    public axis: D3.Svg.Axis;

    constructor(public name: string) {
      super();

    }

    create() {
      // Get the svg container
      var vis: D3.Selection = this.factoryMgr.get('container').vis;

      this.createAxis(vis);
    }

    update(options, attributes: ng.IAttributes) {
      // Get the container dimensions
      var dim: IDimension = this.factoryMgr.get('container').dim;

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
          .attr('class', 'axis ' + this.name + '-axis');
    }

    updateAxis(dim: IDimension) {
      // Move the axis container to the correct position
      if (this.name === 'x') {
        this.svg
          .attr('transform', 'translate(0, ' + dim.innerHeight + ')');
      } else if (this.name === 'y') {
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

      if (this.name === 'x') {
        scale.range([0, dim.innerWidth]);
      } else if (this.name === 'y') {
        scale.range([dim.innerHeight, 0]);
      }

      return scale;
    }

    getAxis(): D3.Svg.Axis {
      // Create a d3 axis generator
      var axis = d3.svg.axis()
        .scale(this.scale);

      if (this.name === 'x') {
        axis.orient('bottom');
      } else if (this.name === 'y') {
        axis.orient('left');
      }

      return axis;
    }
  }
}