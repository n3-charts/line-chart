module n3Charts.Factory.Series {
  'use strict';

  export class Dot extends Utils.SeriesFactory {

    static type: string = Utils.Options.SERIES_TYPES.DOT;

    protected containerClass: string = Dot.type + '-data';
    protected seriesClass: string = Dot.type + '-series';
    protected dataClass: string = Dot.type;

    update(data: Utils.Data, options: Utils.Options) {
      super.update(data, options);

      var series = options.getSeriesForType(Dot.type);

      this.updateSeriesContainer(series);
    }

    updateData(group: D3.Selection, series: Utils.Series, index: number, numSeries: number) {

      var xAxis = <Factory.Axis>this.factoryMgr.get('x-axis');
      var yAxis = <Factory.Axis>this.factoryMgr.get('y-axis');

      var dotsData = this.data.getDatasetValues(series, this.options);
      var dotsRadius = 4;

      var dots = group.selectAll('.' + this.dataClass)
        .data(dotsData, (d: Utils.IPoint) => d.x);

      var initPoint = (s) => {
        s.attr({
          r: (d) => 4,
          cx: (d) => xAxis.scale(d.x),
          cy: (d) => yAxis.scale(0)
        });
      };

      var updatePoint = (s) => {
        s.attr({
          cx: (d) => xAxis.scale(d.x),
          cy: (d) => yAxis.scale(d.y)
        })
        .style('opacity', series.visible ? 1 : 0);
      };

      dots.enter()
        .append('circle')
        .attr('class', this.dataClass)
        .call(this.eventMgr.datumOver(series))
        .call(this.eventMgr.datumOut(series))
        .call(initPoint)
        .transition()
        .call(this.factoryMgr.get('transitions').enter)
        .call(updatePoint);

      dots
        .transition()
        .call(this.factoryMgr.get('transitions').edit)
        .call(updatePoint);

      dots.exit()
        .transition()
        .call(this.factoryMgr.get('transitions').exit)
        .call(initPoint)
        .each('end', function() {
          d3.select(this).remove();
        });
    }

    styleSeries(group: D3.Selection) {
      group.style({
        'fill': (d: Utils.Series) => d.color,
        'stroke': 'white'
      });
    }
  }
}
