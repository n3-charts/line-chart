module n3Charts.Factory.Series {
  'use strict';

  export class Dot extends Utils.BaseFactory {

    public svg: D3.Selection;
    protected containerClassName = 'dot-data';
    protected itemsClassName = 'dot-series';
    protected itemClassName = 'dot';

    create() {
      this.createContainer(this.factoryMgr.get('container').data);
    }

    createContainer(parent: D3.Selection) {
      this.svg = parent
        .append('g')
          .attr('class', this.containerClassName);
    }

    _style(selection:D3.Selection):void {
      selection.style({
        'fill': (s) => s.series.color,
        'stroke': 'white'
      });
    }

    update(datasets: Utils.Datasets, options: Utils.Options) {
      var series = options.getSeriesForType(Utils.Options.SERIES_TYPES.DOT);
      var sets: {} = datasets.getValuesForSeries(series, options);

      var xAxis = <Factory.Axis>this.factoryMgr.get('x-axis');
      var yAxis = <Factory.Axis>this.factoryMgr.get('y-axis');

      var svgs = this.svg.selectAll('.' + this.itemsClassName)
        .data(
          series.map((s) => {return { series: s, set: sets[s.id] }; }),
          (d) => d.series.id
        );

      var group = svgs.enter()
        .append('g')
        .call(this._style)
        .attr({
          class: (d: any) => this.itemsClassName + ' ' + d.series.id
        });

      var dots = svgs.selectAll('.' + this.itemClassName)
        .data((d) => (d.set));

      dots.enter()
        .append('circle')
        .attr({
          class: this.itemClassName,
          r: (d) => 4
        });

      dots
        .transition()
        .call(this.factoryMgr.get('transitions').pimp('dot'))
        .attr({
          cx: (d) => xAxis.scale(d.x),
          cy: (d) => yAxis.scale(d.y)
        });
    }

    destroy() {
      this.svg.remove();
    }
  }
}
