module n3Charts.Factory {
  'use strict';

  export interface IDimension {
    width: number;
    height: number;
    innerWidth: number;
    innerHeight: number;
    margin: {
      left: number;
      bottom: number;
      right: number;
      top: number;
    };
  }

  export class Container extends Utils.BaseFactory {

    public svg: D3.Selection;
    public vis: D3.Selection;
    public dim: IDimension;

    constructor(private element: HTMLElement) {
      super();

    }

    create() {
      console.log('Create '  + this.key);

      this.createRoot();
      this.createContainer();
    }

    update() {
      console.log('Update ' + this.key);

      this.dim = this.getDimensions();
      this.updateRoot();
      this.updateContainer();
    }

    destroy() {
      // Remove the root node
      this.svg.remove();
    }

    createRoot() {
      // Create the SVG root node
      this.svg = d3.select(this.element)
        .append('svg')
          .attr('class', 'chart');
    }

    updateRoot() {
      // Update the dimensions of the root
      this.svg
        .attr('width', this.dim.width)
        .attr('height', this.dim.height);
    }

    createContainer() {
      // Create a visualization container
      this.vis = this.svg
        .append('g')
          .attr('class', 'container');
    }

    updateContainer() {
      // Update the dimensions of the container
      this.vis
        .attr('width', this.dim.innerWidth)
        .attr('height', this.dim.innerHeight)
        .attr('transform', 'translate(' + this.dim.margin.left + ', ' + this.dim.margin.top + ')');
    }

    getDimensions(): IDimension {
      // Get the dimensions of the chart
      return {
        width: 600,
        height: 200,
        innerWidth: 560,
        innerHeight: 160,
        margin: {
          left: 20,
          bottom: 20,
          right: 20,
          top: 20
        }
      };
    }
  }
}