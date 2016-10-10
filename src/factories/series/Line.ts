import * as d3 from 'd3';

import * as Utils from '../../utils/_index';
import * as Series from '../../factories/series/_index';
import * as Options from '../../options/_index';

export class Line extends Series.SeriesFactory {

  public type: string = Options.SeriesOptions.TYPE.LINE;

  updateData(group: d3.Selection<any, Options.ISeriesOptions, any, any>, series: Options.SeriesOptions, index: number, numSeries: number) {
    group.classed('dashed', series.isDashed());

    var {xAxis, yAxis} = this.getAxes(series);

    var lineData = this.data.getDatasetValues(series, this.options);

    var initLine = d3.line<Utils.IPoint>()
      .defined(series.defined)
      .x((d) => xAxis.scale(d.x))
      .y(<number>(yAxis.range()[0]))
      .curve(Utils.Interpolation.getInterpolation(series.interpolation.mode, series.interpolation.tension))
    ;

    var updateLine = d3.line<Utils.IPoint>()
      .defined(series.defined)
      .x((d) => xAxis.scale(d.x))
      .y((d) => yAxis.scale(d.y1))
      .curve(Utils.Interpolation.getInterpolation(series.interpolation.mode, series.interpolation.tension))
    ;

    var line = group.selectAll('.' + this.type)
      .data([lineData]);

    if (this.factoryMgr.get('transitions').isOn()) {
      const init = (_line) => {
        _line
          .attr('class', this.type)
          .attr('d', (d) => initLine(d));
      };

      const update = (_line) => {
        _line
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'enter'))
          .attr('d', (d) => updateLine(d));
      };

      line.call(update);

      line.enter()
          .append('path')
          .call(init)
        .merge(line)
          .call(update);

      line.exit()
        .transition()
        .call(this.factoryMgr.getBoundFunction('transitions', 'exit'))
        .attr('d', (d: Utils.IPoint[]) => initLine(d))
        .on('end', function() {
          d3.select(this).remove();
        });
    } else {
      line.enter()
        .append('path')
        .attr('class', this.type)
        .attr('d', (d) => updateLine(d));

      line
        .attr('d', (d) => updateLine(d))
        .style('opacity', series.visible ? 1 : 0);

      line.exit()
        .remove();
    }
  }

  styleSeries(group: d3.Selection<any, Options.SeriesOptions, any, any>) {
    group
      .style('fill', 'none')
      .style('stroke', (s) => s.color)
      .style('stroke-dasharray', (s) => s.isDashed() ? '10,3' : undefined)
    ;
  }
}
