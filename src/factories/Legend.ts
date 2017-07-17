import * as d3 from 'd3';

import * as Utils from '../utils/_index';
import { Options, SeriesOptions, Dimensions } from '../options/_index';

import { BaseFactory } from './BaseFactory';
import { Container } from './Container';

export class Legend extends BaseFactory {

  private div: d3.Selection<any, any, any, any>;

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

  legendClick(): any {
    return (selection: d3.Selection<any, SeriesOptions, any, any>) => {
      return selection.on('click', (series) => {
        this.eventMgr.trigger('legend-click', series);
      });
    };
  }

  update(data: Utils.Data, options: Options) {
    const init = (_items) => {
      _items.attr('class', 'item');
      _items.call(this.legendClick());
      _items.append('div').attr('class', 'icon');
      _items.append('div').attr('class', 'legend-label');
    };

    const update = (_items) => {
      _items
        .attr('class', (d: SeriesOptions) => 'item ' + d.type.join(' '))
        .classed('legend-hidden', (d) => !d.visible);
      _items.select('.icon').style('background-color', (d) => BaseFactory.evalCondString(d.color));
      _items.select('.legend-label').text((d) => d.label);
    };

    var items = this.div.selectAll('.item')
      .data(options.series);

    // update
    items.call(update);

    // enter (and update, wtf is going on)
    items.enter()
        .append('div')
        .call(init)
      .merge(items)
        .call(update);

    // exit
    items.exit().remove();
  }

  destroy() {
    this.div.remove();
  }
}
