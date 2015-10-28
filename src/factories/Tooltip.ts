module n3Charts.Factory {
  'use strict';

  export class Tooltip extends Utils.BaseFactory {

    // We might wanna find another name for this : it's not an SVG.
    // [lorem--ipsum]
    private svg:D3.Selection;

    constructor(private element: HTMLElement) {
      super();
    }

    create() {
      this.createTooltip();
      this.eventMgr.on('enter.tooltip', this.show.bind(this));
      this.eventMgr.on('leave.tooltip', this.hide.bind(this));
    }

    createTooltip() {
      var svg = this.svg = d3.select(this.element)
        .append('div')
          .attr('class', 'chart-tooltip')
          .style('position', 'absolute');

      svg.append('div')
        .attr('class', 'arrow');

      svg.append('div')
        .attr('class', 'abscissas')
        .style('display', 'inline-block');

      svg.append('div')
        .attr('class', 'value')
        .style('display', 'inline-block');
    }

    destroy() {
      this.svg.remove();
    }

    show(datum: any, index: number, series: Utils.SeriesOptions, options: Utils.Options) {
      this.updateTooltipContent(datum, index, series, options);
      this.updateTooltipPosition(datum, index, series);

      this.svg
        .transition()
        .call(this.factoryMgr.get('transitions').edit)
        .style('opacity', '1');

      return;
    }

    updateTooltipContent(datum: any, index: number, series: Utils.SeriesOptions, options: Utils.Options) {
      var xTickFormat = options.getByAxisSide(Utils.AxisOptions.SIDE.X).tickFormat;
      this.svg.select('.abscissas').text(xTickFormat ? xTickFormat(datum.x, index) : datum.x);

      var yTickFormat = options.getByAxisSide(Utils.AxisOptions.SIDE.Y).tickFormat;
      this.svg.select('.value').text(yTickFormat ? yTickFormat(datum.y1, index) : datum.y1);

      this.svg.style('background-color', series.color);
      this.svg.select('.arrow').style('border-top-color', series.color);
    }

    updateTooltipPosition(datum: any, index: number, series: Utils.SeriesOptions) {
      var xScale = this.factoryMgr.get('x-axis').scale;
      var yScale = this.factoryMgr.get('y-axis').scale;

      var x = xScale(datum.x);
      if (series.isAColumn()) {
        x += this.factoryMgr.get('series-column').getTooltipPosition(series);
      }

      var margin = this.factoryMgr.get('container').getDimensions().margin;
      var leftOffset = this.element.offsetLeft;
      var topOffset = this.element.offsetTop;

      this.svg
        .classed('positive', datum.y1 >= 0)
        .classed('negative', datum.y1 < 0)
        .style({
          'left': (leftOffset + margin.left + x) + 'px',
          'top': (topOffset + margin.top + yScale(datum.y1)) + 'px'
        });

      return;
    }

    hide() {
      // Next time one of us has to write this, I'll disable this goddamn linter.
      var self = this.svg;

      this.svg
        .transition()
        .call(this.factoryMgr.get('transitions').edit)
        .style('opacity', '0')
        .each('end', () => self.style({'left': '0px', 'top': '0px'}));

      return;
    }
  }
}
