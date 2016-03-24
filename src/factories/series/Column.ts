module n3Charts.Factory.Series {
  'use strict';

  export class Column extends Factory.Series.SeriesFactory {

    public type: string = Options.SeriesOptions.TYPE.COLUMN;

    private gapFactor: number = 0.2;
    private outerPadding: number = (this.gapFactor / 2) * 3;
    private columnsWidth: number = 0;

    public innerXScale: d3.scale.Ordinal<string, number>;

    softUpdate() {
      var series = this.options.getSeriesByType(this.type).filter((s) => s.visible);
      this.updateColumnsWidth(series, this.options);
      this.updateColumnScale(series, this.options);
      this.updateSeriesContainer(series);
    }

    update(data: Utils.Data, options: Options.Options) {
      this.data = data;
      this.options = options;

      var series = options.getSeriesByType(this.type).filter((s) => s.visible);

      this.updateColumnsWidth(series, options);
      this.updateColumnScale(series, options);
      this.updateSeriesContainer(series);
    }

    updateColumnsWidth(series: Options.ISeriesOptions[], options: Options.Options) {
      var xAxis = <Factory.Axis>this.factoryMgr.get('x-axis');

      var colsDatasets = this.data.getDatasets(series, options);
      var delta = Utils.Data.getMinDistance(colsDatasets, xAxis, 'x');

      this.columnsWidth = delta < Number.MAX_VALUE ? delta / series.length : 10;
    }

    updateColumnScale(series: Options.ISeriesOptions[], options: Options.Options) {
      var halfWidth = this.columnsWidth * series.length / 2;

      this.innerXScale = d3.scale.ordinal()
        .domain(series.map((s) => s.id))
        .rangeBands([-halfWidth, halfWidth], 0, 0.1);
    }

    getTooltipPosition(series: Options.ISeriesOptions) {
      return this.innerXScale(series.id) + this.innerXScale.rangeBand() / 2;
    }

    updateData(group: d3.selection.Update<Options.ISeriesOptions>, series: Options.SeriesOptions, index: number, numSeries: number) {
      var {xAxis, yAxis} = this.getAxes(series);

      var colsData = this.data.getDatasetValues(series, this.options).filter(series.defined);

      var xFn = (d) => xAxis.scale(d.x) + this.innerXScale(series.id);

      var initCol = (s) => {
        s.attr({
          x: xFn,
          y: (d) => yAxis.scale(d.y0),
          width: this.innerXScale.rangeBand(),
          height: 0
        });
      };

      var updateCol = (s) => {
        s.attr({
          x: xFn,
          y: (d) => d.y1 > 0 ? yAxis.scale(d.y1) : yAxis.scale(d.y0),
          width: this.innerXScale.rangeBand(),
          height: (d) => Math.abs(yAxis.scale(d.y0) - yAxis.scale(d.y1))
        })
        .style('opacity', series.visible ? 1 : 0);
      };

      var cols = group.selectAll('.' + this.type)
        .data(colsData, (d) => '' + d.x);

      if (this.factoryMgr.get('transitions').isOn()) {
        cols.enter()
          .append('rect')
          .attr('class', this.type)
          .call(this.eventMgr.datumEnter(series, this.options))
          .call(this.eventMgr.datumOver(series, this.options))
          .call(this.eventMgr.datumMove(series, this.options))
          .call(this.eventMgr.datumLeave(series, this.options))
          .call(initCol)
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'enter'))
          .call(updateCol);

        cols
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'edit'))
          .call(updateCol);

        cols.exit()
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'exit'))
          .call(initCol)
          .each('end', function() {
            d3.select(this).remove();
          });
      } else {
        cols.enter()
          .append('rect')
          .attr('class', this.type)
          .call(this.eventMgr.datumEnter(series, this.options))
          .call(this.eventMgr.datumOver(series, this.options))
          .call(this.eventMgr.datumMove(series, this.options))
          .call(this.eventMgr.datumLeave(series, this.options))
          .call(updateCol);

        cols
          .call(updateCol);

        cols.exit()
          .remove();
      }
    }

    styleSeries(group: d3.Selection<Options.SeriesOptions>) {
      group.style({
        'fill': (d) => d.color,
        'stroke': (d) => d.color,
        'stroke-width': 1
      });
    }
  }
}
