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

      if ([Axis.SIDE_X, Axis.SIDE_Y].indexOf(side) < 0) {
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

      this.scale = this.getScale(dim);
      this.axis = this.getAxis();

      this.updateScaleDomain(data, options);
      this.updateAxisSize(dim);
    }

    destroy() {
      this.destroyAxis();
    }

    updateScaleDomain(data: Utils.Data, options: Utils.Options) {
      this.scale.domain(this.getExtent(data, options));
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

      return [min, max];
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
        if (series.axis === this.side) {
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

    updateAxisSize(dim: IDimension) {
      // Move the axis container to the correct position
      if (this.side === Axis.SIDE_X) {
        this.svg
          .attr('transform', 'translate(0, ' + dim.innerHeight + ')');
      } else if (this.side === Axis.SIDE_Y) {
        this.svg
          .attr('transform', 'translate(0, 0)');
      }

      // Generate the Axis
      this.svg
        .transition()
        .call(this.factoryMgr.get('transitions').edit)
        .call(this.axis);
    }

    destroyAxis() {
      // Remove the axis container
      this.svg.remove();
    }

    getScale(dim: IDimension): D3.Scale.Scale {
      // Create a d3.scale object
      var scale = d3.scale.linear();

      if (this.side === Axis.SIDE_X) {
        scale.range([0, dim.innerWidth]);
      } else if (this.side === Axis.SIDE_Y) {
        scale.range([dim.innerHeight, 0]);
      }

      return scale;
    }

    getAxis(): D3.Svg.Axis {
      // Create a d3 axis generator
      var axis = d3.svg.axis()
        .scale(this.scale);

      if (this.side === Axis.SIDE_X) {
        axis.orient('bottom');
      } else if (this.side === Axis.SIDE_Y) {
        axis.orient('left');
      }

      return axis;
    }
  }
}
