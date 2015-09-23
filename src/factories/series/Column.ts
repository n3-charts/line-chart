module n3Charts.Factory.Series {
  'use strict';

  export class Column extends Utils.SeriesFactory {

    public type: string = Utils.Options.SERIES_TYPES.COLUMN;

    private gapFactor: number = 0.2;
    private outerPadding: number = (this.gapFactor / 2) * 3;
    private columnsWidth: number = 0;

    public innerXScale: D3.Scale.OrdinalScale;

    update(data: Utils.Data, options: Utils.Options) {
      super.update(data, options);

      var series = options.getSeriesByType(this.type).filter((s) => s.visible);

      this.updateColumnsWidth(series, options);
      this.updateColumnScale(series, options);
      this.updateSeriesContainer(series);
    }

    updateColumnsWidth(series: Utils.Series[], options: Utils.Options) {
      var xAxis = <Factory.Axis>this.factoryMgr.get('x-axis');

      var colsDatasets = this.data.getDatasets(series, options);
      var delta = Utils.Data.getMinDistance(colsDatasets, xAxis.scale, 'x');

      this.columnsWidth = delta < Number.MAX_VALUE ? delta / series.length : 10;
    }

    updateColumnScale(series: Utils.Series[], options: Utils.Options) {
      var halfWidth = this.columnsWidth * series.length / 2;

      this.innerXScale = d3.scale.ordinal()
        .domain(series.map((s) => s.id))
        .rangeBands([-halfWidth, halfWidth], 0, 0.1);
    }

    getTooltipPosition(series: Utils.Series) {
      return this.innerXScale(series.id) + this.innerXScale.rangeBand() / 2;
    }

    updateData(group: D3.Selection, series: Utils.Series, index: number, numSeries: number) {
      var xAxis = <Factory.Axis>this.factoryMgr.get('x-axis');
      var yAxis = <Factory.Axis>this.factoryMgr.get('y-axis');

      var colsData = this.data.getDatasetValues(series, this.options);

      var xFn = (d) => xAxis.scale(d.x) + this.innerXScale(series.id);

      var initCol = (s) => {
        s.attr({
          x: xFn,
          y: yAxis.scale(0),
          width: this.innerXScale.rangeBand(),
          height: 0
        });
      };

      var updateCol = (s) => {
        s.attr({
          x: xFn,
          y: (d) => d.y > 0 ? yAxis.scale(d.y) : yAxis.scale(0),
          width: this.innerXScale.rangeBand(),
          height: (d) => Math.abs(yAxis.scale(0) - yAxis.scale(d.y))
        })
        .style('opacity', series.visible ? 1 : 0);
      };

      var cols = group.selectAll('.' + this.type)
        .data(colsData, (d: Utils.IPoint) => d.x);

      cols.enter()
        .append('rect')
        .attr('class', this.type)
        .call(this.eventMgr.datumEnter(series))
        .call(this.eventMgr.datumOver(series))
        .call(this.eventMgr.datumMove(series))
        .call(this.eventMgr.datumLeave(series))
        .call(initCol)
        .transition()
        .call(this.factoryMgr.get('transitions').enter)
        .call(updateCol);

      cols
        .transition()
        .call(this.factoryMgr.get('transitions').edit)
        .call(updateCol);

      cols.exit()
        .transition()
        .call(this.factoryMgr.get('transitions').exit)
        .call(initCol)
        .each('end', function() {
          d3.select(this).remove();
        });
    }

    styleSeries(group: D3.Selection) {
      group.style({
        'fill': (d: Utils.Series) => d.color,
        'fill-opacity': 0.5,
        'stroke': (d: Utils.Series) => d.color,
        'stroke-width': 1
      });
    }
  }
}
