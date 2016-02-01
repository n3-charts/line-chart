module n3Charts.Factory.Series {
  'use strict';

  export class Dot extends Factory.Series.SeriesFactory {

    public type: string = Options.SeriesOptions.TYPE.DOT;

    updateData(group: D3.Selection, series: Options.SeriesOptions, index: number, numSeries: number) {
      var xAxis = <Factory.Axis>this.factoryMgr.get('x-axis');
      var yAxis = <Factory.Axis>this.factoryMgr.get('y-axis');

      var dotsData = this.data.getDatasetValues(series, this.options).filter(series.defined);
      var dotsRadius = 2;

      var dots = group.selectAll('.' + this.type)
        .data(dotsData, (d: Utils.IPoint) => d.x);

      var initPoint = (s) => {
        s.attr({
          r: (d) => dotsRadius,
          cx: (d) => xAxis.scale(d.x),
          cy: (d) => yAxis.scale.range()[0]
        });
      };

      var updatePoint = (s) => {
        s.attr({
          cx: (d) => xAxis.scale(d.x),
          cy: (d) => yAxis.scale(d.y1)
        })
        .style('opacity', series.visible ? 1 : 0);
      };

      if (this.factoryMgr.get('transitions').isEnabled()) {
        dots.enter()
          .append('circle')
          .attr('class', this.type)
          .call(this.eventMgr.datumEnter(series, this.options))
          .call(this.eventMgr.datumOver(series, this.options))
          .call(this.eventMgr.datumMove(series, this.options))
          .call(this.eventMgr.datumLeave(series, this.options))
          .call(initPoint)
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'enter'))
          .call(updatePoint);

        dots
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'edit'))
          .call(updatePoint);

        dots.exit()
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'exit'))
          .call(initPoint)
          .each('end', function() {
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

    styleSeries(group: D3.Selection) {
      group.style({
        'stroke': (d: Options.SeriesOptions) => d.color
      });
    }
  }
}
