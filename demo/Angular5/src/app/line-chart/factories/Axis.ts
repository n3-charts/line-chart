import * as d3 from 'd3';
import * as ng from 'angular';

import * as Utils from '../utils/_index';
import * as Options from '../options/_index';
import * as Factory from '../factories/_index';

interface ITick {
  value: Date | number;
  label: string;
}

export class Axis extends Factory.BaseFactory {
  public svg: d3.Selection<any, any, any, any>;
  private _scale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>;
  public scale: (value: number | Date) => number;
  public d3axis: d3.Axis<number>;

  private options: Options.AxisOptions;

  range(): (number)[] {
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
    var vis: d3.Selection<any, any, any, any> = this.factoryMgr.get('container').axes;

    this.createAxis(vis);

    this.eventMgr.on('pan.' + this.key, this.softUpdate.bind(this));
    this.eventMgr.on('zoom-end.' + this.key, this.softUpdate.bind(this));
    this.eventMgr.on('outer-world-domain-change.' + this.key, this.updateFromOuterWorld.bind(this));
    this.eventMgr.on('resize.' + this.key, this.onResize.bind(this));
  }

  updateFromOuterWorld(domains: Utils.IDomains) {
    this.updateScaleDomain(domains[this.side]);
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

    this.updateScaleRange(dim, this.options);
    this.updateAxisContainer(dim);
    this.softUpdate();
  }

  getDimensions(): Options.Dimensions {
    // Get the container dimensions
    var container = <Factory.Container> this.factoryMgr.get('container');
    return container.getDimensions();
  }

  update(data: Utils.Data, options: Options.Options) {
    var dimensions = this.getDimensions();

    // Get the [min, max] extent of the axis
    var extent = this.getExtent(data, options);

    // Get the options for the axis
    this.options = options.getByAxisSide(this.side);

    this._scale = this.getScale();
    this.updateScaleRange(dimensions, this.options);
    this.updateScaleDomain(extent);

    this.d3axis = this.getAxis(this._scale, this.options);
    this.updateAxisContainer(dimensions);
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

  updateScaleRange(dimensions: Options.Dimensions, axisOptions: Options.AxisOptions) {
    if (this.isAbscissas()) {
      this._scale.range([axisOptions.padding.min, dimensions.innerWidth - axisOptions.padding.max]);
    } else {
      this._scale.range([dimensions.innerHeight - axisOptions.padding.min, axisOptions.padding.max]);
    }
  }

  updateScaleDomain(extent: number[]) {
    (this._scale as any).domain(extent);
  }

  getScaleDomain(): (number|Date)[] {
    return this._scale ? this._scale.domain() : [0, 1];
  }

  getExtent(datasets: Utils.Data, options: Options.Options) {
    var axisOptions = options.getByAxisSide(this.side);
    var extent = undefined;

    if (this.isAbscissas()) {
      let activeDatasets = options.getVisibleDatasets();
      let abscissasKey = options.getAbsKey();

      let xValues = [];
      activeDatasets.forEach(key => {
        let data = datasets.sets[key].values;
        xValues = xValues.concat(data.map(datum => datum[abscissasKey]));
      });

      extent = d3.extent(xValues);
    } else {
      let lowests = axisOptions.includeZero ? [0] : [];
      let highests = axisOptions.includeZero ? [0] : [];

      let series = options.getVisibleSeriesBySide(this.side);

      if (this.side === Options.AxisOptions.SIDE.Y2 && series.length === 0) {
        series = options.getVisibleSeriesBySide(Options.AxisOptions.SIDE.Y);
      }

      series.forEach(s => {
        let values = datasets.getDatasetValues(s, options);
        values.forEach(datum => {
          if (s.defined && !s.defined(datum)) {
            return;
          }

          lowests.push(datum.y0 || datum.y1);
          highests.push(datum.y1);
        });
      });

      extent = [<number>d3.min(lowests), <number>d3.max(highests)];

      if (extent[0] === 0 && extent[1] === 0) {
        extent = [0, 1];
      }
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
    var fn = (v): number => v;

    if (value instanceof Date) {
      fn = (v): number => v.getTime();
    }

    var [a, b] = this._scale.domain();

    return fn(value) > fn(a) + (fn(b) - fn(a)) / 2;
  }

  createAxis(vis: d3.Selection<any, any, any, any>) {
    this.svg = vis
      .append('g')
        .attr('class', 'axis ' + this.side + '-axis');
  }

  updateAxisContainer(dim: Options.Dimensions) {
    // Move the axis container to the correct position
    if (this.isAbscissas()) {
      if (this.side === Options.AxisOptions.SIDE.X) {
        this.svg
          .attr('transform', `translate(0, ${dim.innerHeight})`);
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

  invert(value: number): number|Date {
    return this._scale.invert(value);
  }

  isTimeAxis() {
    return this.options.type === Options.AxisOptions.TYPE.DATE;
  }

  getScale(): d3.ScaleLinear<number, number> | d3.ScaleTime<number, number> {
    if (this.options && this.options.type === Options.AxisOptions.TYPE.DATE) {
      return d3.scaleTime();
    }

    if (this.options && this.options.type === Options.AxisOptions.TYPE.LOG) {
      return d3.scaleLog();
    }

    return d3.scaleLinear();
  }

  getAxis(scale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>, options: Options.AxisOptions): d3.Axis<number> {
    var axis = this.getRegularAxis(scale);

    options.configure(axis);

    return axis;
  }

  getRegularAxis(scale: d3.ScaleLinear<number, number> | d3.ScaleTime<number, number>): d3.Axis<number> {
    if (this.isAbscissas()) {
      if (this.side === Options.AxisOptions.SIDE.X) {
        return d3.axisBottom(scale) as d3.Axis<number>;
      } else {
        return d3.axisTop(scale) as d3.Axis<number>;
      }
    } else {
      if (this.side === Options.AxisOptions.SIDE.Y) {
        return d3.axisLeft(scale) as d3.Axis<number>;
      } else {
        return d3.axisRight(scale) as d3.Axis<number>;
      }
    }
  }

  cloneAxis(): d3.Axis<number> {

    return this.getRegularAxis(this._scale)
      .ticks(this.d3axis.tickArguments()[0])
      .scale(this.d3axis.scale())
      .tickValues(this.d3axis.tickValues())
      .tickSize(this.d3axis.tickSize())
      .tickFormat(this.d3axis.tickFormat());
  }
}
