module n3Charts.Factory.Series {
  'use strict';

  export class Line extends Utils.BaseFactory {

    public svg: D3.Selection;

    constructor() {
      super();
    }

    create() {
      var container: Container = this.factoryMgr.get('container');

      this.createContainer(container.data);
    }

    createContainer(parent: D3.Selection) {
      this.svg = parent
        .append('g')
          .attr('class', 'line-data');
    }

    _getDrawers(series: Utils.OptionsSeries[]): any {
      var xScale = <Factory.Axis>this.factoryMgr.get('x-axis');
      var yScale = <Factory.Axis>this.factoryMgr.get('y-axis');

      var drawers = {};

      series.forEach((s) => {
        drawers[s.id] = d3.svg.line()
          .x((d) => xScale.scale(d.x))
          .y((d) => yScale.scale(d.y));
      });

      return drawers;
    }

    update(datasets: Utils.Datasets, options: Utils.Options) {
      var lines = options.getSeriesForType(Utils.Options.SERIES_TYPES.LINE);
      var sets: {} = datasets.getValuesForSeries(lines, options);
      var drawers: {} = this._getDrawers(lines);

      var svgs = this.svg.selectAll('.line-series')
        .data(
          lines.map((s) => {return { series: s, set: sets[s.id] }; }),
          (d) => d.series.id
        );

      svgs.enter()
        .append('g')
        .attr({
          class: (d: Utils.OptionsSeries) => 'line-series ' + d.key
        })
        .append('path');

      svgs.select('path')
        .style({
          'fill': 'none',
          'stroke': (s) => s.series.color
        })
        .transition()
        .call(this.factoryMgr.get('transitions').pimp('line'))
        .attr({
          class: 'line',
          d: (s) => drawers[s.series.id](s.set)
        });
    }

    destroy() {
      this.svg.remove();
    }
  }
}
