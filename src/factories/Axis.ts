module n3Charts.Factory {
  'use strict';

  export class Axis extends Utils.BaseFactory {

    public svg: D3.Selection;
    public scale: D3.Scale.Scale;
    public axis: D3.Svg.Axis;
    public static SIDE_X: string = 'x';
    public static SIDE_Y: string = 'y';

    constructor(public side: string) {
      super();

      if ([Axis.SIDE_X, Axis.SIDE_Y].indexOf(side) === -1) {
        throw new TypeError('Wrong axis side : ' + side);
      }
    }

    create() {
      // Get the svg container
      var vis: D3.Selection = this.factoryMgr.get('container').axes;

      this.createAxis(vis);
    }

    update(data:Utils.Data, options:Utils.Options) {
      // Get the container dimensions
      var container = <Factory.Container> this.factoryMgr.get('container');
      var dim: IDimension = container.getDimensions();

      // Get the [min, max] extent of the axis
      var extent = this.getExtent(data, options);

      // Get the options for the axis
      var axisOptions = options.getByAxisSide(this.side);

      this.scale = this.getScale(axisOptions);
      this.updateScaleRange(dim);
      this.updateScaleDomain(extent);

      this.axis = this.getAxis(this.scale);
      this.updateAxisOrientation();
      this.updateAxisContainer(dim);
    }

    destroy() {
      this.destroyAxis();
    }

    updateScaleRange(dim: IDimension) {
      if (this.side === Axis.SIDE_X) {
        this.scale.range([0, dim.innerWidth]);
      } else if (this.side === Axis.SIDE_Y) {
        this.scale.range([dim.innerHeight, 0]);
      }
    }

    updateScaleDomain(extent: Number[]) {
      this.scale.domain(extent);
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

    getExtent(datasets: Utils.Data, options: Utils.Options) {
      if (this.isAbscissas()) {
        var abscissasKey = options.getAbsKey();
        return this.getExtentForDatasets(
          datasets,
          () => true,
          (datum) => [datum[abscissasKey], datum[abscissasKey]]
        );
      }

      var datasetsForSide = [];
      var seriesForDataset = {};
      options.series.forEach((series) => {
        if (series.visible && series.axis === this.side) {
          datasetsForSide.push(series.dataset);
          if (!seriesForDataset[series.dataset]) {
            seriesForDataset[series.dataset] = [];
          }
          seriesForDataset[series.dataset].push(series);
        }
      });

      return this.getExtentForDatasets(
        datasets,
        (key) => datasetsForSide.indexOf(key) > -1,
        (datum, datasetKey) => {
          var data = seriesForDataset[datasetKey].map((series) => datum[series.key]);
          return [<number>d3.min(data), <number>d3.max(data)];
        }
      );
    }

    isAbscissas() {
      return this.side === Axis.SIDE_X;
    }

    createAxis(vis: D3.Selection) {
      // Create the axis container
      this.svg = vis
        .append('g')
          .attr('class', 'axis ' + this.side + '-axis');
    }

    updateAxisOrientation() {
      if (this.side === Axis.SIDE_X) {
        this.axis.orient('bottom');
      } else if (this.side === Axis.SIDE_Y) {
        this.axis.orient('left');
      }
    }

    updateAxisContainer(dim: IDimension) {
      // Move the axis container to the correct position
      if (this.side === Axis.SIDE_X) {
        this.svg
          .attr('transform', 'translate(0, ' + dim.innerHeight + ')');
      } else if (this.side === Axis.SIDE_Y) {
        this.svg
          .attr('transform', 'translate(0, 0)');
      }

      // Redraw the Axis
      this.svg
        .transition()
        .call(this.factoryMgr.get('transitions').edit)
        .call(this.axis);
    }

    destroyAxis() {
      // Remove the axis container
      this.svg.remove();
    }

    getScale(options: Utils.AxisOptions): D3.Scale.Scale {
      // Create and return a D3 Scale
      var scale: D3.Scale.Scale;

      if (options.type === Utils.AxisOptions.TYPE.DATE) {
        return d3.time.scale();
      }

      return d3.scale.linear();
    }

    getAxis(scale: D3.Scale.Scale): D3.Svg.Axis {
      // Create and return a D3 Axis generator
      return d3.svg.axis()
        .scale(scale);
    }
  }
}
