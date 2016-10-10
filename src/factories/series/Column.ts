import * as d3 from 'd3';

import * as Utils from '../../utils/_index';
import * as Factory from '../../factories/_index';
import * as Series from '../../factories/series/_index';
import * as Options from '../../options/_index';

export class Column extends Series.SeriesFactory {

  public type: string = Options.SeriesOptions.TYPE.COLUMN;

  private gapFactor: number = 0.2;
  private outerPadding: number = (this.gapFactor / 2) * 3;
  private columnsWidth: number = 0;

  public innerXScale: d3.ScaleBand<string>;

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

    // TODO See https://github.com/d3/d3/blob/master/CHANGES.md#scales-d3-scale
    // if this is messed up
    this.innerXScale = d3.scaleBand()
      .domain(series.map((s) => s.id))
      .range([-halfWidth, halfWidth])
      .paddingInner(0)
      .paddingOuter(0.1);
  }

  getTooltipPosition(series: Options.ISeriesOptions) {
    return this.innerXScale(series.id) + this.innerXScale.step() / 2;
  }

  updateData(group: d3.Selection<any, Options.ISeriesOptions, any, any>, series: Options.SeriesOptions, index: number, numSeries: number) {
    var {xAxis, yAxis} = this.getAxes(series);

    var colsData = this.data.getDatasetValues(series, this.options).filter(series.defined);

    var xFn = (d) => xAxis.scale(d.x) + this.innerXScale(series.id);

    var initCol = (_columns) => {
      _columns
        .attr('x', xFn)
        .attr('y', (d) => yAxis.scale(d.y0))
        .attr('width', this.innerXScale.step())
        .attr('height', 0)
      ;
    };

    var updateCol = (_columns) => {
      _columns
        .attr('x', xFn)
        .attr('y', (d) => d.y1 > 0 ? yAxis.scale(d.y1) : yAxis.scale(d.y0))
        .attr('width', this.innerXScale.step())
        .attr('height', (d) => Math.abs(yAxis.scale(d.y0) - yAxis.scale(d.y1)))
      .style('opacity', series.visible ? 1 : 0);
    };

    var cols = group.selectAll('.' + this.type)
      .data(colsData, (d: Utils.IPoint) => '' + d.x);

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
        .on('end', function() {
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

  styleSeries(group: d3.Selection<any, Options.SeriesOptions, any, any>) {
    group
      .style('fill', (d) => d.color)
      .style('stroke', (d) => d.color)
      .style('stroke-width', 1)
    ;
  }
}
