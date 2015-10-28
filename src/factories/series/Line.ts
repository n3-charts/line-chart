module n3Charts.Factory.Series {
  'use strict';

  export class Line extends Utils.SeriesFactory {

    public type: string = Utils.SeriesOptions.TYPE.LINE;

    updateData(group: D3.Selection, series: Utils.SeriesOptions, index: number, numSeries: number) {
      group.classed('dashed', series.isDashed());

      var xAxis = <Factory.Axis>this.factoryMgr.get('x-axis');
      var yAxis = <Factory.Axis>this.factoryMgr.get('y-axis');

      var lineData = this.data.getDatasetValues(series, this.options);

      var initLine = d3.svg.line()
        .x((d) => xAxis.scale(d.x))
        .y(yAxis.scale(0));

      var updateLine = d3.svg.line()
        .x((d) => xAxis.scale(d.x))
        .y((d) => yAxis.scale(d.y1));

      var line = group.selectAll('.' + this.type)
        .data([lineData]);

      line.enter()
        .append('path')
        .attr('class', this.type)
        .attr('d', (d) => initLine(d))
        .transition()
        .call(this.factoryMgr.get('transitions').enter)
        .attr('d', (d) => updateLine(d));

      line
        .transition()
        .call(this.factoryMgr.get('transitions').edit)
        .attr('d', (d) => updateLine(d))
        .style('opacity', series.visible ? 1 : 0);

      line.exit()
        .transition()
        .call(this.factoryMgr.get('transitions').exit)
        .attr('d', (d) => initLine(d))
        .each('end', function() {
          d3.select(this).remove();
        });
    }

    styleSeries(group: D3.Selection) {
      group.style({
        'fill': 'none',
        'stroke': (s: Utils.SeriesOptions) => s.color,
        'stroke-dasharray': (s: Utils.SeriesOptions) => s.isDashed() ? '10,3' : undefined
      });
    }
  }
}
