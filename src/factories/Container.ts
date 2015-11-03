module n3Charts.Factory {
  'use strict';

  export class Container extends Utils.BaseFactory {

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

      this.data = this.vis
        .append('g')
          .attr('class', 'data');

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
    }

    getDimensions(): Utils.Dimensions {
      return this.dim;
    }
  }
}
