module n3Charts.Factory {
  'use strict';

  export interface ICoordinates {
    x?: number|Date;
    y?: number;
  }

  export class Container extends BaseFactory {

    public defs: D3.Selection;

    public svg: D3.Selection;
    public vis: D3.Selection;
    public data: D3.Selection;
    public overlay: D3.Selection;
    public axes: D3.Selection;
    public dim: Options.Dimensions = new Options.Dimensions();

    private clippingPathId:string;

    constructor(private element: HTMLElement) {
      super();
    }

    create(options: Options.Options) {
      this.dim.updateMargins(options);
      this.listenToElement(this.element, options);
      this.createRoot();
      this.createContainer();
      this.dim.fromParentElement(this.element.parentElement);
      this.eventMgr.on('resize', () => {
        this.dim.fromParentElement(this.element.parentElement);
        this.update();
      });

      // D3, Y U NO DBLCKICK ?
      this.eventMgr.listenForDblClick(this.svg, () => {
        this.eventMgr.trigger('zoom-pan-reset', true);
      }, this.key);

      this.eventMgr.on('zoom-pan-reset.' + this.key, (event) => {
        this.eventMgr.triggerDataAndOptions('update');
      });
    }

    listenToElement(element: HTMLElement, options: Options.Options) {
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
      var dim: Options.Dimensions = this.getDimensions();

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

    update() {
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

      this.clippingPathId = 'clipping-path-' + Utils.UUID.generate();
      this.defs.append('svg:clipPath')
        .attr('id', this.clippingPathId)
          .append('svg:rect')
          .attr('id', 'clipping-rect');

      this.data = this.vis
        .append('g')
          .attr({
            'class': 'data',
            'clip-path': 'url(#' + this.clippingPathId + ')'
          });

      this.overlay = this.vis
        .append('g')
          .attr('class', 'overlay');
    }

    updateContainer() {
      this.vis
        .attr({
          'width': this.dim.innerWidth,
          'height': Math.max(this.dim.innerHeight, 0),
          'transform': 'translate(' + this.dim.margin.left + ', ' + this.dim.margin.top + ')'
        });

      d3.select(this.element).select('#clipping-rect')
        .attr({
          'width': this.dim.innerWidth,
          'height': Math.max(this.dim.innerHeight, 0)
        });
    }

    getDimensions(): Options.Dimensions {
      return this.dim;
    }
  }
}
