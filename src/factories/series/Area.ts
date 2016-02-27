module n3Charts.Factory.Series {
  'use strict';

  export class Area extends Factory.Series.SeriesFactory {

    public type: string = Options.SeriesOptions.TYPE.AREA;

    updateData(group: D3.Selection, series: Options.SeriesOptions, index: number, numSeries: number) {
      var {xAxis, yAxis} = this.getAxes(series);

      var areaData = this.data.getDatasetValues(series, this.options);

      var initArea = d3.svg.area()
        .defined(series.defined)
        .x((d) => xAxis.scale(d.x))
        .y0(yAxis.scale.range()[0])
        .y1(yAxis.scale.range()[0])
        .interpolate(series.interpolation.mode)
        .tension(series.interpolation.tension);

      var updateArea = d3.svg.area()
        .defined(series.defined)
        .x((d) => xAxis.scale(d.x))
        .y0((d) => isNaN(yAxis.scale(d.y0)) ? yAxis.scale.range()[0] : yAxis.scale(d.y0))
        .y1((d) => yAxis.scale(d.y1))
        .interpolate(series.interpolation.mode)
        .tension(series.interpolation.tension);

      var area = group.selectAll('.' + this.type)
        .data([areaData]);

      if (this.factoryMgr.get('transitions').isOn()) {
        area.enter()
          .append('path')
          .attr('class', this.type)
          .attr('d', (d) => initArea(d))
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'enter'))
          .attr('d', (d) => updateArea(d));

        area
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'edit'))
          .attr('d', (d) => updateArea(d))
          .style('opacity', series.visible ? 1 : 0);

        area.exit()
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'exit'))
          .attr('d', (d) => initArea(d))
          .each('end', function() { d3.select(this).remove(); });
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

    styleSeries(group: D3.Selection) {
      group.style({
        'fill': (s: Options.SeriesOptions) => s.color,
        'stroke': (s: Options.SeriesOptions) => s.color
      });
    }
  }
}
