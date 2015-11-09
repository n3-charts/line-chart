module n3Charts.Factory.Series {
  'use strict';

  export class Area extends Utils.SeriesFactory {

    public type: string = Utils.SeriesOptions.TYPE.AREA;

    updateData(group: D3.Selection, series: Utils.SeriesOptions, index: number, numSeries: number) {

      var xAxis = <Factory.Axis>this.factoryMgr.get('x-axis');
      var yAxis = <Factory.Axis>this.factoryMgr.get('y-axis');

      var areaData = this.data.getDatasetValues(series, this.options);

      var initArea = d3.svg.area()
        .x((d) => xAxis.scale(d.x))
        .y0(yAxis.scale.range()[0])
        .y1(yAxis.scale.range()[0])
        .interpolate(series.interpolation.mode)
        .tension(series.interpolation.tension);

      var updateArea = d3.svg.area()
        .x((d) => xAxis.scale(d.x))
        .y0((d) => isNaN(yAxis.scale(d.y0)) ? yAxis.scale.range()[0] : yAxis.scale(d.y0))
        .y1((d) => yAxis.scale(d.y1))
        .interpolate(series.interpolation.mode)
        .tension(series.interpolation.tension);

      var area = group.selectAll('.' + this.type)
        .data([areaData]);

      area.enter()
        .append('path')
        .attr('class', this.type)
        .attr('d', (d) => initArea(d))
        .transition()
        .call(this.factoryMgr.get('transitions').enter)
        .attr('d', (d) => updateArea(d));

      area
        .transition()
        .call(this.factoryMgr.get('transitions').edit)
        .attr('d', (d) => updateArea(d))
        .style('opacity', series.visible ? 1 : 0);

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
        'fill': (s: Utils.SeriesOptions) => s.color,
        'stroke': (s: Utils.SeriesOptions) => s.color
      });
    }
  }
}
