module n3Charts.Factory.Series {
  'use strict';

  export class Column extends Utils.SeriesFactory {

    static type: string = Utils.Options.SERIES_TYPES.COLUMN;

    protected containerClass: string = Column.type + '-data';
    protected seriesClass: string = Column.type + '-series';
    protected dataClass: string = Column.type;

    public colsWidth: number = 0;

    update(data: Utils.Data, options: Utils.Options) {
      super.update(data, options);

      var series = options.getSeriesForType(Column.type);

      this.updateColsWidth(series);
      this.updateSeriesContainer(series);
    }

    updateColsWidth(series: Utils.Series[]) {

      var xAxis = <Factory.Axis>this.factoryMgr.get('x-axis');

      var colsDatasets = this.data.getDatasets(series, this.options);
      var delta = Utils.Data.getMinDistance(colsDatasets, xAxis.scale, 'x');

      this.colsWidth = delta < Number.MAX_VALUE ? delta / series.length : 10;
    }

    updateData(group: D3.Selection, series: Utils.Series, index: number, numSeries: number) {

      var xAxis = <Factory.Axis>this.factoryMgr.get('x-axis');
      var yAxis = <Factory.Axis>this.factoryMgr.get('y-axis');

      var colsData = this.data.getDatasetValues(series, this.options);
      var colsWidthSpacing = 0.1;

      var initCol = (s) => {
        s.attr({
          x: (d) => xAxis.scale(d.x) - (numSeries * 0.5 - index) * this.colsWidth,
          y: yAxis.scale(0),
          width: this.colsWidth * (1 - colsWidthSpacing),
          height: 0
        });
      };

      var updateCol = (s) => {
        s.attr({
          x: (d) => xAxis.scale(d.x) - (numSeries * 0.5 - index) * this.colsWidth,
          y: (d) => yAxis.scale(d.y),
          width: this.colsWidth * (1 - colsWidthSpacing),
          height: (d) => yAxis.scale(0) - yAxis.scale(d.y)
        });
      };

      var cols = group.selectAll('.' + this.dataClass)
        .data(colsData, (d: Utils.IPoint) => d.x);

      cols.enter()
        .append('rect')
        .attr('class', this.dataClass)
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
        'stroke': 'white',
        'stroke-width': 0
      });
    }
  }
}
