module n3Charts.Factory.Series {
  'use strict';

  export class Line extends Factory.Series.SeriesFactory {

    public type: string = Options.SeriesOptions.TYPE.LINE;

    updateData(group: d3.selection.Update<Options.ISeriesOptions>, series: Options.SeriesOptions, index: number, numSeries: number) {
      group.classed('dashed', series.isDashed());

      var {xAxis, yAxis} = this.getAxes(series);

      var lineData = this.data.getDatasetValues(series, this.options);


      var initLine = d3.svg.line<Utils.IPoint>()
        .defined(series.defined)
        .x((d) => xAxis.scale(d.x))
        .y(<number>(yAxis.range()[0]))
        .interpolate(series.interpolation.mode)
        .tension(series.interpolation.tension);

      var updateLine = d3.svg.line<Utils.IPoint>()
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
          .style('opacity', series.visible ? 1 : 0);

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
          .style('opacity', series.visible ? 1 : 0);

        line.exit()
          .remove();
      }
    }

    styleSeries(group: d3.Selection<Options.SeriesOptions>) {
      group.style({
        'fill': 'none',
        'stroke': (s) => s.color,
        'stroke-dasharray': (s) => s.isDashed() ? '10,3' : undefined
      });
    }
  }
}
