module n3Charts.Factory.Series {
  'use strict';

  export class Area extends Line {
    protected containerClassName = 'area-series';
    protected itemClassName = 'area';

    createContainer(parent: D3.Selection) {
      this.svg = parent
        .append('g')
          .attr('class', 'area-data');
    }

    _getDrawers(series: Utils.OptionsSeries[]): any {
      var xScale = <Factory.Axis>this.factoryMgr.get('x-axis');
      var yScale = <Factory.Axis>this.factoryMgr.get('y-axis');

      var drawers = {};

      var y0 = yScale.scale(yScale.scale.domain()[0]);

      series.forEach((s) => {
        drawers[s.id] = d3.svg.area()
          .x((d) => xScale.scale(d.x))
          .y0(y0)
          .y1((d) => yScale.scale(d.y));
      });

      return drawers;
    }

    _getSeriesToDraw(options: Utils.Options):any[] {
      return options.getSeriesForType(Utils.Options.SERIES_TYPES.AREA);
    }

    _style(selection:D3.Selection):void {
      selection.style({
        'fill': (s) => s.series.color,
        'stroke': (s) => s.series.color,
        'opacity': '0.3'
      });
    }
  }
}
