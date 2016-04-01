module n3Charts.Factory {
  'use strict';

  export interface ICoordinates {
    x?: number|Date;
    y?: number;
  }

  export class Container extends BaseFactory {

    public defs: d3.Selection<any>;

    public svg: d3.Selection<any>;
    public vis: d3.Selection<any>;

    public data: d3.Selection<any>;
    public overlay: d3.Selection<any>;
    public symbols: d3.Selection<any>;
    public axes: d3.Selection<any>;

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

      var xScale = (<Factory.Axis>this.factoryMgr.get('x-axis'));
      var x = xScale.invert(event.clientX - left - dim.margin.left);

      var yScale = (<Factory.Axis>this.factoryMgr.get('y-axis'));
      var y = <number>yScale.invert(event.clientY - top - dim.margin.top);

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

      this.symbols = this.overlay
        .append('g')
          .attr({
            'class': 'symbols',
            'clip-path': 'url(#' + this.clippingPathId + ')'
          });
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
          'width': Math.max(this.dim.innerWidth, 0),
          'height': Math.max(this.dim.innerHeight, 0)
        });
    }

    getDimensions(): Options.Dimensions {
      return this.dim;
    }
  }
}
