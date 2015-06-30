module n3Charts.Factory.Series {
  'use strict';

  export class Line extends Utils.BaseFactory {

    public svg: D3.Selection;
    protected containerClassName = 'line-data';
    protected itemsClassName = 'line-series';
    protected itemClassName = 'line';

    create() {
      this.createContainer(this.factoryMgr.get('container').data);
    }

    createContainer(parent: D3.Selection) {
      this.svg = parent
        .append('g')
          .attr('class', this.containerClassName);
    }

    _getDrawers(series: Utils.OptionsSeries[]): any {
      var xScale = <Factory.Axis>this.factoryMgr.get('x-axis');
      var yScale = <Factory.Axis>this.factoryMgr.get('y-axis');

      var drawers = {};

      series.forEach((s) => {
        drawers[s.id] = d3.svg.line()
          .x((d) => xScale.scale(d.x))
          .y((d) => yScale.scale(d.y));
      });

      return drawers;
    }

    _getSeriesToDraw(options: Utils.Options):any[] {
      return options.getSeriesForType(Utils.Options.SERIES_TYPES.LINE);
    }

    _style(selection:D3.Selection):void {
      selection.style({
        'fill': 'none',
        'stroke': (s) => s.series.color
      });
    }

    update(datasets: Utils.Datasets, options: Utils.Options) {
      var series = this._getSeriesToDraw(options);
      var sets: {} = datasets.getValuesForSeries(series, options);
      var drawers: {} = this._getDrawers(series);

      var svgs = this.svg.selectAll('.' + this.itemsClassName)
        .data(
          series.map((s) => {return { series: s, set: sets[s.id] }; }),
          (d) => d.series.id
        );

      svgs.enter()
        .append('g')
        .attr({
          class: (d: any) => this.itemsClassName + ' ' + d.series.id
        })
        .append('path');

      svgs.select('path')
        .call(this._style)
        .transition()
        .call(this.factoryMgr.get('transitions').pimp('line'))
        .attr({
          class: this.itemClassName,
          d: (s) => drawers[s.series.id](s.set)
        });
    }

    destroy() {
      this.svg.remove();
    }
  }
}
