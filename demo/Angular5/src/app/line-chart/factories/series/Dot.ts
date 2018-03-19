import * as d3 from 'd3';

import * as Utils from '../../utils/_index';
import * as Series from '../../factories/series/_index';
import * as Options from '../../options/_index';

export class Dot extends Series.SeriesFactory {

  public type: string = Options.SeriesOptions.TYPE.DOT;

  updateData(group: d3.Selection<any, Options.ISeriesOptions, any, any>, series: Options.SeriesOptions, index: number, numSeries: number) {
    var {xAxis, yAxis} = this.getAxes(series);

    var dotsData = this.data.getDatasetValues(series, this.options).filter(series.defined);
    var dotsRadius = 2;

    var initPoint = (_dots) => {
      _dots
        .attr('r', (d) => dotsRadius)
        .attr('cx', (d) => xAxis.scale(d.x))
        .attr('cy', (d) => yAxis.range()[0])
      ;
    };

    var updatePoint = (_dots) => {
      _dots
        .attr('r', (d) => dotsRadius)
        .attr('cx', (d) => xAxis.scale(d.x))
        .attr('cy', (d) => yAxis.scale(d.y1))
      .style('opacity', series.visible ? 1 : 0);
    };

    var dots = group.selectAll('.' + this.type)
      .data(dotsData, (d: Utils.IPoint) => '' + d.x);

    if (this.factoryMgr.get('transitions').isOn()) {
      dots
        .transition()
        .call(this.factoryMgr.getBoundFunction('transitions', 'edit'))
        .call(updatePoint);

      dots.enter()
        .append('circle')
          .attr('class', this.type)
          .call(this.eventMgr.datumEnter(series, this.options))
          .call(this.eventMgr.datumOver(series, this.options))
          .call(this.eventMgr.datumMove(series, this.options))
          .call(this.eventMgr.datumLeave(series, this.options))
          .call(initPoint)
        .merge(dots)
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'enter'))
          .call(updatePoint);


      dots.exit()
        .transition()
        .call(this.factoryMgr.getBoundFunction('transitions', 'exit'))
        .call(initPoint)
        .on('end', function() {
          d3.select(this).remove();
        });
    } else {
      dots.enter()
        .append('circle')
        .attr('class', this.type)
        .call(this.eventMgr.datumEnter(series, this.options))
        .call(this.eventMgr.datumOver(series, this.options))
        .call(this.eventMgr.datumMove(series, this.options))
        .call(this.eventMgr.datumLeave(series, this.options))
        .call(updatePoint);

      dots
        .call(updatePoint);

      dots.exit()
        .remove();
    }
  }

  styleSeries(group: d3.Selection<any, Options.SeriesOptions, any, any>) {
    group.style('stroke', (d) => d.color);
  }
}
