/// <reference path='./BaseFactory.ts' />

module n3Charts.Factory {
  'use strict';

  interface ITick {
    value: Date | number;
    label: string;
  }

  export class Axis extends BaseFactory {
    public svg: d3.Selection<any>;
    private _scale: d3.scale.Linear<number, number> | d3.time.Scale<number, number>;
    public scale:(value: number | Date) => number;
    public d3axis: d3.svg.Axis;

    private options: Options.AxisOptions;

    range():(number|Date)[] {
      return this._scale.range();
    }

    getDomain(): (number|Date)[] {
      return this._scale.domain();
    }

    setDomain(d: (number|Date)[]) {
      return this._scale.domain.call(this, d);
    }

    constructor(public side: string) {
      super();

      if (!Options.AxisOptions.isValidSide(side)) {
        throw new TypeError('Wrong axis side : ' + side);
      }

      this.scale = (value: number | Date) => this._scale.call(this, value);
    }

    create() {
      var vis: d3.Selection<any> = this.factoryMgr.get('container').axes;

      this.createAxis(vis);

      this.eventMgr.on('pan.' + this.key, this.softUpdate.bind(this));
      this.eventMgr.on('zoom-end.' + this.key, this.softUpdate.bind(this));
      this.eventMgr.on('outer-world-domain-change.' + this.key, this.updateFromOuterWorld.bind(this));
      this.eventMgr.on('resize.' + this.key, this.onResize.bind(this));
    }

    updateFromOuterWorld(domains: {x:number, y:number}) {
      this.updateScaleDomain(domains[this.side[0]]);
      this.softUpdate();
    }

    softUpdate() {
      if (this.factoryMgr.get('transitions').isOn()) {
        this.svg
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'edit'))
          .call(this.d3axis);
      } else {
        this.svg.call(this.d3axis);
      }
    }

    onResize() {
      var container = <Factory.Container> this.factoryMgr.get('container');
      var dim: Options.Dimensions = container.getDimensions();

      this.updateScaleRange(dim);
      this.updateAxisContainer(dim);
      this.softUpdate();
    }

    update(data:Utils.Data, options:Options.Options) {
      // Get the container dimensions
      var container = <Factory.Container> this.factoryMgr.get('container');
      var dim: Options.Dimensions = container.getDimensions();

      // Get the [min, max] extent of the axis
      var extent = this.getExtent(data, options);

      // Get the options for the axis
      this.options = options.getByAxisSide(this.side);

      this._scale = this.getScale();
      this.updateScaleRange(dim);
      this.updateScaleDomain(extent);

      this.d3axis = this.getAxis(this._scale, this.options);
      this.updateAxisOrientation(this.d3axis);
      this.updateAxisContainer(dim);
      this.shiftAxisTicks(this.options);
    }

    shiftAxisTicks(options: Options.AxisOptions) {
      var {x, y} = options.ticksShift;

      this.svg.selectAll('text')
        .attr('transform', `translate(${x}, ${y})`);
    }

    destroy() {
      this.destroyAxis();
    }

    updateScaleRange(dim: Options.Dimensions) {
      if (this.isAbscissas()) {
        this._scale.range([0, dim.innerWidth]);
      } else {
        this._scale.range([dim.innerHeight, 0]);
      }
    }

    updateScaleDomain(extent: number[]) {
      this._scale.domain(extent);
    }

    getScaleDomain():(number|Date)[] {
      return this._scale ? this._scale.domain() : [0, 1];
    }

    getExtentForDatasets(
      data: Utils.Data,
      filter: (key:string) => Boolean,
      accessor: (datum, datasetKey:string) => number[]
    ) {
      var min = Number.POSITIVE_INFINITY;
      var max = Number.NEGATIVE_INFINITY;

      for (var key in data.sets) {
        if (!filter(key)) { continue; };

        data.sets[key].values.forEach((datum) => {
          var data = accessor(datum, key);
          if (data[0] < min) { min = data[0]; }
          if (data[1] > max) { max = data[1]; }
        });
      }

      return [
        min === Number.POSITIVE_INFINITY ? 0 : min,
        max === Number.NEGATIVE_INFINITY ? 1 : max
      ];
    }

    getExtent(datasets: Utils.Data, options: Options.Options) {
      var axisOptions = options.getByAxisSide(this.side);
      var extent = undefined;

      if (this.isAbscissas()) {
        var activeDatasets = options.getVisibleDatasets();
        var abscissasKey = options.getAbsKey();
        extent = this.getExtentForDatasets(
          datasets,
          (key) => activeDatasets.indexOf(key) > -1,
          (datum) => [datum[abscissasKey], datum[abscissasKey]]
        );
      } else {
        var {datasetsForSide, seriesForDataset} = options.getSeriesAndDatasetBySide(this.side);

        extent = this.getExtentForDatasets(
          datasets,
          (key) => datasetsForSide.indexOf(key) > -1,
          (datum, datasetKey) => {
            var highest = seriesForDataset[datasetKey].map((series) => datum[series.key.y1]);
            var lowest = seriesForDataset[datasetKey].map((series) => datum[series.key.y0] || datum[series.key.y1]);
            return [<number>d3.min(lowest), <number>d3.max(highest)];
          }
        );
      }

      if (axisOptions.min !== undefined) {
        extent[0] = axisOptions.min;
      }

      if (axisOptions.max !== undefined) {
        extent[1] = axisOptions.max;
      }

      return extent;
    }

    isAbscissas() {
      return [Options.AxisOptions.SIDE.X, Options.AxisOptions.SIDE.X2].indexOf(this.side) !== -1;
    }

    isInLastHalf(value: any): Boolean {
      var fn = (v):number => v;

      if (value instanceof Date) {
        fn = (v):number => v.getTime();
      }

      var [a, b] = this._scale.domain();

      return fn(value) > fn(a) + (fn(b) - fn(a)) / 2;
    }

    createAxis(vis: d3.Selection<any>) {
      this.svg = vis
        .append('g')
          .attr('class', 'axis ' + this.side + '-axis');
    }

    updateAxisOrientation(axis) {
      if (this.isAbscissas()) {
        if (this.side === Options.AxisOptions.SIDE.X) {
          axis.orient('bottom');
        } else {
          axis.orient('top');
        }
      } else {
        if (this.side === Options.AxisOptions.SIDE.Y) {
          axis.orient('left');
        } else {
          axis.orient('right');
        }
      }
    }

    updateAxisContainer(dim: Options.Dimensions) {
      // Move the axis container to the correct position
      if (this.isAbscissas()) {
        if (this.side === Options.AxisOptions.SIDE.X) {
          this.svg
            .attr('transform', 'translate(0, ' + dim.innerHeight + ')');
        } else {
          this.svg
            .attr('transform', 'translate(0, 0)');
        }
      } else {
        if (this.side === Options.AxisOptions.SIDE.Y) {
          this.svg
            .attr('transform', 'translate(0, 0)');
        } else {
          this.svg
            .attr('transform', `translate(${dim.innerWidth}, 0)`);
        }
      }

      this.softUpdate();
    }

    destroyAxis() {
      // Remove the axis container
      this.svg.remove();
    }

    invert(value: number):number|Date {
      return this._scale.invert(value);
    }

    isTimeAxis() {
      return this.options.type === Options.AxisOptions.TYPE.DATE;
    }

    getScale(): d3.scale.Linear<number, number> | d3.time.Scale<number, number> {
      if (this.options && this.options.type === Options.AxisOptions.TYPE.DATE) {
        return d3.time.scale();
      }

      if (this.options && this.options.type === Options.AxisOptions.TYPE.LOG) {
        return d3.scale.log();
      }

      return d3.scale.linear();
    }

    getAxis(scale: d3.scale.Linear<number, number> | d3.time.Scale<number, number>, options: Options.AxisOptions): d3.svg.Axis {
      var axis: any;

      // Create and return a D3 Axis generator
      if (options.hasDynamicTicks()) {
        axis = n3Charts.svg.twoSpeedAxis()
          .scale(scale);
      } else {
        axis = d3.svg.axis()
          .scale(scale);
      }

      options.configure(axis);

      return axis;
    }

    cloneAxis(): d3.svg.Axis {
      var axis: d3.svg.Axis;

      if (this.options && this.options.hasDynamicTicks()) {
        axis = n3Charts.svg.twoSpeedAxis()
          .ticks(this.d3axis.ticks());
      } else {
        axis = d3.svg.axis()
          .ticks(this.d3axis.ticks()[0]);
      }

      return axis
        .scale(this.d3axis.scale())
        .orient(this.d3axis.orient())
        .tickValues(this.d3axis.tickValues())
        .tickSize(this.d3axis.tickSize());

        // dafuq is wrong with this tslinter ???
        // .tickFormat(this.d3axis.tickFormat);
    }
  }
}
