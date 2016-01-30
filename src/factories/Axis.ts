module n3Charts.Factory {
  'use strict';

  export class Axis extends Factory.BaseFactory {

    public svg: D3.Selection;
    public scale: D3.Scale.Scale;
    public d3axis: D3.Svg.Axis;

    constructor(public side: string) {
      super();

      if (!Options.AxisOptions.isValidSide(side)) {
        throw new TypeError('Wrong axis side : ' + side);
      }
    }

    create() {
      // Get the svg container
      var vis: D3.Selection = this.factoryMgr.get('container').axes;

      this.createAxis(vis);

      this.eventMgr.on('zoom.' + this.key, this.softUpdate.bind(this));
    }

    // This simply redraws the axis, without reprocessing the extent
    softUpdate() {
      this.svg.call(this.d3axis);
    }

    update(data:Utils.Data, options:Options.Options) {
      // Get the container dimensions
      var container = <Factory.Container> this.factoryMgr.get('container');
      var dim: Options.Dimensions = container.getDimensions();

      // Get the [min, max] extent of the axis
      var extent = this.getExtent(data, options);

      // Get the options for the axis
      var axisOptions = options.getByAxisSide(this.side);

      this.scale = this.getScale(axisOptions);
      this.updateScaleRange(dim);
      this.updateScaleDomain(extent);

      this.d3axis = this.getAxis(this.scale, axisOptions);
      this.updateAxisOrientation(this.d3axis);
      this.updateAxisContainer(dim);
      this.shiftAxisTicks(axisOptions);
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
        this.scale.range([0, dim.innerWidth]);
      } else {
        this.scale.range([dim.innerHeight, 0]);
      }
    }

    updateScaleDomain(extent: Number[]) {
      this.scale.domain(extent);
    }

    getScaleDomain():Number[] {
      if (!this.scale) {
        return [0, 1];
      }

      return this.scale.domain();
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

      var [a, b] = this.scale.domain();

      return fn(value) > fn(a) + (fn(b) - fn(a)) / 2;
    }

    createAxis(vis: D3.Selection) {
      // Create the axis container
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

      // Redraw the Axis
      this.svg
        .transition()
        .call(this.factoryMgr.get('transitions').edit)
        .call(this.d3axis);
    }

    destroyAxis() {
      // Remove the axis container
      this.svg.remove();
    }

    getScale(options: Options.AxisOptions): D3.Scale.Scale {
      // Create and return a D3 Scale
      var scale: D3.Scale.Scale;

      if (options.type === Options.AxisOptions.TYPE.DATE) {
        return d3.time.scale();
      }

      if (options.type === Options.AxisOptions.TYPE.LOG) {
        return d3.scale.log();
      }

      return d3.scale.linear();
    }

    getAxis(scale: D3.Scale.Scale, options: Options.AxisOptions): D3.Svg.Axis {
      // Create and return a D3 Axis generator
      var axis = d3.svg.axis()
        .scale(scale);

      options.configure(axis);

      return axis;
    }

    cloneAxis(): D3.Svg.Axis {
      return d3.svg.axis()
        .scale(this.d3axis.scale())
        .orient(this.d3axis.orient())
        .tickValues(this.d3axis.tickValues())
        .ticks(this.d3axis.ticks()[0])
        .tickSize(this.d3axis.tickSize());

        // dafuq is wrong with this tslinter ???
        // .tickFormat(this.d3axis.tickFormat);
    }
  }
}
