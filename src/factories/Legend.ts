module n3Charts.Factory {
  'use strict';

  export class Legend extends Utils.BaseFactory {

    // We might wanna find another name for this : it's not an SVG (same as for
    // the tooltip).
    // [lorem--ipsum]
    private svg:D3.Selection;

    constructor(private element: HTMLElement) {
      super();
    }

    create() {
      this.createLegend();
    }

    createLegend() {
      var svg = this.svg = d3.select(this.element)
        .append('div')
          .attr('class', 'chart-legend')
          .style('position', 'absolute');
    }

    update(data:Utils.Data, options:Utils.Options) {
      // Get the container dimensions
      var container = <Factory.Container> this.factoryMgr.get('container');
      var dim: IDimension = container.getDimensions();

      var init = (s) => {
        var items = s.append('div').attr({'class': 'item'})
          .call(this.eventMgr.legendClick());

        items.append('div').attr({'class': 'icon'});
        items.append('div').attr({'class': 'label'});
      };

      var update = (s) => {
        s.attr('class', (d) => 'item ' + d.getMainType());
        s.select('.icon').style('background-color', (d) => d.color);
        s.select('.label').text((d) => d.label);
      };

      var legendItems = this.svg.selectAll('.item')
        .data(options.series);

      legendItems.enter().call(init);
      legendItems.call(update);
      legendItems.exit().remove();
    }

    destroy() {
      this.svg.remove();
    }
  }
}
