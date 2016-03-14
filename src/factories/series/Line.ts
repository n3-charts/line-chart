module n3Charts.Factory.Series {
  'use strict';

  export class Line extends Factory.Series.SeriesFactory {

    public type: string = Options.SeriesOptions.TYPE.LINE;

    updateData(group: D3.Selection, series: Options.SeriesOptions, index: number, numSeries: number) {
      group.classed('dashed', series.isDashed());

      var {xAxis, yAxis} = this.getAxes(series);

      var lineData = this.data.getDatasetValues(series, this.options);


      var initLine = d3.svg.line()
        .defined(series.defined)
        .x((d) => xAxis.scale(d.x))
        .y(yAxis.scale.range()[0])
        .interpolate(series.interpolation.mode)
        .tension(series.interpolation.tension);

      var updateLine = d3.svg.line()
        .defined(series.defined)
        .x((d) => xAxis.scale(d.x))
        .y((d) => yAxis.scale(d.y1))
        .interpolate(series.interpolation.mode)
        .tension(series.interpolation.tension);

      var line = group.selectAll('.' + this.type)
        .data([lineData]);

      if (this.factoryMgr.get('transitions').isOn()) {
        line.enter()
          .append('path')
          .attr('class', this.type)
          .attr('d', (d) => initLine(d))
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'enter'))
          .attr('d', (d) => updateLine(d));

        line
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'edit'))
          .attr('d', (d) => updateLine(d))
          .style('stroke-width', series.thickness);

        line.exit()
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'exit'))
          .attr('d', (d) => initLine(d))
          .each('end', function() {
            d3.select(this).remove();
          });
      } else {
        line.enter()
          .append('path')
          .attr('class', this.type)
          .attr('d', (d) => updateLine(d));

        line
          .attr('d', (d) => updateLine(d))
          .style('stroke-width', series.thickness);

        line.exit()
          .remove();
      }
    }

    styleSeries(group: D3.Selection) {
      group.style({
        'fill': 'none',
        'stroke': (s: Options.SeriesOptions) => s.color,
        'stroke-dasharray': (s: Options.SeriesOptions) => s.isDashed() ? '10,3' : undefined
      });
    }
  }
}
