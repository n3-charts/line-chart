module n3Charts.Factory.Series {
  'use strict';

  export class Area extends Utils.SeriesFactory {

    static type: string = Utils.Options.SERIES_TYPES.AREA;

    protected containerClass: string = Area.type + '-data';
    protected seriesClass: string = Area.type + '-series';
    protected dataClass: string = Area.type;

    update(data: Utils.Data, options: Utils.Options) {
      super.update(data, options);

      var series = options.getSeriesForType(Area.type);

      this.updateSeriesContainer(series);
    }

    updateData(group: D3.Selection, series: Utils.Series, index: number, numSeries: number) {

      var xScale = <Factory.Axis>this.factoryMgr.get('x-axis');
      var yScale = <Factory.Axis>this.factoryMgr.get('y-axis');

      var areaData = this.data.getDatasetValues(series, this.options);

      var initArea = d3.svg.area()
        .x((d) => xScale.scale(d.x))
        .y0(yScale.scale(0))
        .y1((d) => yScale.scale(0));

      var updateArea = d3.svg.area()
        .x((d) => xScale.scale(d.x))
        .y0(yScale.scale(0))
        .y1((d) => yScale.scale(d.y));

      var area = group.selectAll('.' + this.dataClass)
        .data([areaData]);

      area.enter()
        .append('path')
        .attr('class', this.dataClass)
        .attr('d', (d) => initArea(d))
        .transition()
        .call(this.factoryMgr.get('transitions').enter)
        .attr('d', (d) => updateArea(d));

      area
        .transition()
        .call(this.factoryMgr.get('transitions').edit)
        .attr('d', (d) => updateArea(d));

      area.exit()
        .transition()
        .call(this.factoryMgr.get('transitions').exit)
        .attr('d', (d) => initArea(d))
        .each('end', function() {
          d3.select(this).remove();
        });
    }

    styleSeries(group: D3.Selection) {
      group.style({
        'fill': (s: Utils.Series) => s.color,
        'stroke': (s: Utils.Series) => s.color,
        'opacity': 0.3
      });
    }
  }
}
