import * as d3 from 'd3';

import * as Options from '../../options/_index';
import * as Utils from '../../utils/_index';

import { SeriesFactory } from './SeriesFactory';

export class Area extends SeriesFactory {

  public type: string = Options.SeriesOptions.TYPE.AREA;

  updateData(group: d3.Selection<any, Options.SeriesOptions, any, any>, series: Options.SeriesOptions, index: number, numSeries: number) {
    var {xAxis, yAxis} = this.getAxes(series);
    var areaData = this.data.getDatasetValues(series, this.options);

    var isOkay = (value) => isFinite(value) && !isNaN(value);

    var initArea = d3.area<Utils.IPoint>()
      .defined(series.defined)
      .x((d) => xAxis.scale(d.x))
      .y0(yAxis.range()[0])
      .y1(yAxis.range()[0])
      .curve(Utils.Interpolation.getInterpolation(series.interpolation.mode, series.interpolation.tension))
    ;

    var updateArea = d3.area<Utils.IPoint>()
      .defined(series.defined)
      .x((d) => xAxis.scale(d.x))
      .y0((d) => isOkay(yAxis.scale(d.y0)) ? yAxis.scale(d.y0) : yAxis.range()[0])
      .y1((d) => yAxis.scale(d.y1))
      .curve(Utils.Interpolation.getInterpolation(series.interpolation.mode, series.interpolation.tension))
    ;

    var area = group.selectAll('.' + this.type)
      .data([areaData]);

    if (this.factoryMgr.get('transitions').isOn()) {
      const init = (_area) => {
        _area
          .attr('class', this.type)
          .attr('d', (d) => initArea(d));
      };

      const update = (_area) => {
        _area
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'enter'))
          .attr('d', (d) => updateArea(d));
      };

      area.call(update);

      area.enter()
          .append('path')
          .call(init)
        .merge(area)
          .call(update);

      area.exit()
        .transition()
        .call(this.factoryMgr.getBoundFunction('transitions', 'exit'))
        .attr('d', (d) => initArea(d as Utils.IPoint[]))
        .on('end', function() { d3.select(this).remove(); });
    } else {
      area.enter()
        .append('path')
        .attr('class', this.type)
        .attr('d', (d) => updateArea(d));

      area
        .attr('d', (d) => updateArea(d))
        .style('opacity', series.visible ? 1 : 0);

      area.exit()
        .remove();
    }

  }

  styleSeries(group: d3.Selection<any, Options.SeriesOptions, any, any>) {
    group
      .style('fill', (s) => s.color)
      .style('stroke', (s) => s.color)
    ;
  }
}
