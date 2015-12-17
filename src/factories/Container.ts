module n3Charts.Factory {
  'use strict';

  export interface ICoordinates {
    x?: number|Date;
    y?: number;
  }

  export class Container extends Utils.BaseFactory {

    public defs: D3.Selection;

    public svg: D3.Selection;
    public vis: D3.Selection;
    public data: D3.Selection;
    public overlay: D3.Selection;
    public axes: D3.Selection;
    public dim: Utils.Dimensions = new Utils.Dimensions();

    constructor(private element: HTMLElement) {
      super();
    }

    create(options: Utils.Options) {
      this.dim.updateMargins(options);
      this.listenToElement(this.element, options);
      this.createRoot();
      this.createContainer();
      this.eventMgr.on('resize', this.dim.fromParentElement.bind(this.dim));
    }

    listenToElement(element: HTMLElement, options: Utils.Options) {
      var eventMgr = this.eventMgr;

      element.addEventListener('mouseover', (event) => {
        eventMgr.triggerDataAndOptions.apply(eventMgr, ['container-over', event]);
      });

      element.addEventListener('mousemove', (event) => {
        eventMgr.triggerDataAndOptions.apply(eventMgr, ['container-move', event]);
      });

      element.addEventListener('mouseout', (event) => {
        eventMgr.triggerDataAndOptions.apply(eventMgr, ['container-out', event]);
      });
    }

    getCoordinatesFromEvent(event): ICoordinates {
      var dim: Utils.Dimensions = this.getDimensions();

      var {left, top} = event.currentTarget.getBoundingClientRect();

      var xScale = this.factoryMgr.get('x-axis').scale;
      var x = xScale.invert(event.clientX - left - dim.margin.left);

      var yScale = this.factoryMgr.get('y-axis').scale;
      var y = yScale.invert(event.clientY - top - dim.margin.top);

      if (y < yScale.domain()[0] || y > yScale.domain()[1]) {
        y = undefined;
      }

      if (x < xScale.domain()[0] || x > xScale.domain()[1]) {
        x = undefined;
      }

      return {y, x};
    }

    update(datasets, options) {
      this.updateRoot();
      this.updateContainer();
    }

    destroy() {
      this.destroyRoot();
    }

    createRoot() {
      // Create the SVG root node
      this.svg = d3.select(this.element)
        .append('svg')
          .attr('class', 'chart');

      this.defs = this.svg
        .append('defs');
    }

    updateRoot() {
      // Update the dimensions of the root
      this.svg
        .attr('width', this.dim.width)
        .attr('height', this.dim.height);
    }

    destroyRoot() {
      // Remove the root node
      this.svg.remove();
    }

    createContainer() {
      // Create a visualization container
      this.vis = this.svg
        .append('g')
          .attr('class', 'container');

      this.axes = this.vis
        .append('g')
          .attr('class', 'axes');

      this.defs.append('svg:clipPath')
        .attr('id', 'clipping-path')
          .append('svg:rect')
          .attr('id', 'clipping-rect');

      this.data = this.vis
        .append('g')
          .attr({
            'class': 'data',
            'clip-path': 'url(#clipping-path)'
          });

      this.overlay = this.vis
        .append('g')
          .attr('class', 'overlay');
    }

    updateContainer() {
      // Update the dimensions of the container
      this.vis
        .attr({
          'width': this.dim.innerWidth,
          'height': this.dim.innerHeight,
          'transform': 'translate(' + this.dim.margin.left + ', ' + this.dim.margin.top + ')'
        });

      d3.select(this.element).select('#clipping-rect')
        .attr({
          'width': this.dim.innerWidth,
          'height': this.dim.innerHeight + this.dim.margin.top,
          'transform': `translate(0, ${-this.dim.margin.top})`
        });
    }

    getDimensions(): Utils.Dimensions {
      return this.dim;
    }
  }
}
