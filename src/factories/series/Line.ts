module n3Charts.Factory.Series {
  'use strict';

  export class Line extends Utils.SeriesFactory {

    static type: string = Utils.Options.SERIES_TYPES.LINE;

    protected containerClass: string = Line.type + '-data';
    protected seriesClass: string = Line.type + '-series';
    protected dataClass: string = Line.type;

    update(data: Utils.Data, options: Utils.Options) {
      super.update(data, options);

      var series = options.getSeriesForType(Line.type);

      this.updateSeriesContainer(series);
    }

    updateData(group: D3.Selection, series: Utils.Series, index: number, numSeries: number) {

      var xScale = <Factory.Axis>this.factoryMgr.get('x-axis');
      var yScale = <Factory.Axis>this.factoryMgr.get('y-axis');

      var lineData = this.data.getDatasetValues(series, this.options);

      var initLine = d3.svg.line()
        .x((d) => xScale.scale(d.x))
        .y(yScale.scale(0));

      var updateLine = d3.svg.line()
        .x((d) => xScale.scale(d.x))
        .y((d) => yScale.scale(d.y));

      var line = group.selectAll('.' + this.dataClass)
        .data([lineData]);

      line.enter()
        .append('path')
        .attr('class', this.dataClass)
        .attr('d', (d) => initLine(d))
        .transition()
        .call(this.factoryMgr.get('transitions').enter)
        .attr('d', (d) => updateLine(d));

      line
        .transition()
        .call(this.factoryMgr.get('transitions').edit)
        .attr('d', (d) => updateLine(d));

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
        'stroke': (s: Utils.Series) => s.color
      });
    }
  }
}
