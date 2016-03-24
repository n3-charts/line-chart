module n3Charts.Factory {
  'use strict';

  export class Legend extends Factory.BaseFactory {

    private div:d3.Selection<any>;

    constructor(private element: HTMLElement) {
      super();
    }

    create() {
      this.createLegend();
    }

    createLegend() {
      this.div = d3.select(this.element)
        .append('div')
          .attr('class', 'chart-legend')
          .style('position', 'absolute');
    }

    legendClick() {
      return (selection: d3.Selection<Options.SeriesOptions>) => {
        return selection.on('click', (series) => {
          this.eventMgr.trigger('legend-click', series);
        });
      };
    }

    update(data:Utils.Data, options:Options.Options) {
      var container = <Factory.Container> this.factoryMgr.get('container');
      var dim: Options.Dimensions = container.getDimensions();

      var init = (series) => {
        var items = series.append('div').attr({'class': 'item'})
          .call(this.legendClick());

        items.append('div').attr({'class': 'icon'});
        items.append('div').attr({'class': 'legend-label'});
      };

      var update = (series) => {
        series
          .attr('class', (d:Options.SeriesOptions) => 'item ' + d.type.join(' '))
          .classed('legend-hidden', (d) => !d.visible);
        series.select('.icon').style('background-color', (d) => d.color);
        series.select('.legend-label').text((d) => d.label);
      };

      var legendItems = this.div.selectAll('.item')
        .data(options.series);

      legendItems.enter().call(init);
      legendItems.call(update);
      legendItems.exit().remove();
    }

    destroy() {
      this.div.remove();
    }
  }
}
