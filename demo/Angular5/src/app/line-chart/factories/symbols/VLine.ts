import * as d3 from 'd3';

import * as Utils from '../../utils/_index';
import * as Factory from '../../factories/_index';
import * as Options from '../../options/_index';

export class VLine extends Factory.BaseFactory {

  public svg: d3.Selection<any, any, any, any>;
  private options: Options.Options;

  create() {
    this.svg = (<Factory.Container>this.factoryMgr.get('container')).symbols
      .append('g')
        .attr('class', 'vlines');

    this.eventMgr.on('resize.' + this.key, this.softUpdate.bind(this));
    this.eventMgr.on('pan.' + this.key, this.softUpdate.bind(this));
    this.eventMgr.on('zoom-end.' + this.key, this.softUpdate.bind(this));
    this.eventMgr.on('outer-world-domain-change.' + this.key, this.softUpdate.bind(this));
  }

  softUpdate() {
    var xAxis = <Factory.Axis>this.factoryMgr.get('x-axis');
    var yAxis = <Factory.Axis>this.factoryMgr.get('y-axis');

    var vline = this.svg.selectAll('.vline')
      .data(this.options.getSymbolsByType(Options.SymbolOptions.TYPE.VLINE), (o: Options.SymbolOptions) => o.id);

    var init = (selection: d3.Selection<any, Options.SymbolOptions, any, any> | d3.Transition<any, Options.SymbolOptions, any, any>) => {
      selection
        .attr('class', 'vline')
        .style('opacity', 0)
        .style('stroke', o => o.color)
      ;
    };

    var update = (selection: d3.Selection<any, Options.SymbolOptions, any, any> | d3.Transition<any, Options.SymbolOptions, any, any>) => {
      selection
        .attr('x1', o => xAxis.scale(o.value))
        .attr('x2', o => xAxis.scale(o.value))
        .attr('y1', yAxis.scale(yAxis.getDomain()[0]))
        .attr('y2', yAxis.scale(yAxis.getDomain()[1]))
        .style('opacity', 1)
      ;
    };

    if (this.factoryMgr.get('transitions').isOn()) {
      vline.enter()
        .append('svg:line')
        .call(init)
        .transition()
        .call(this.factoryMgr.getBoundFunction('transitions', 'enter'))
        .call(update);

      vline
        .transition()
        .call(this.factoryMgr.getBoundFunction('transitions', 'edit'))
        .call(update);

      vline.exit()
        .transition()
        .call(this.factoryMgr.getBoundFunction('transitions', 'exit'))
        .style('opacity', 0)
        .on('end', function() {
          d3.select(this).remove();
        });
    } else {
      vline.enter()
        .append('svg:line')
        .call(init);

      vline
        .call(update);

      vline.exit()
        .remove();
    }
  }

  update(data: Utils.Data, options: Options.Options) {
    this.options = options;
    this.softUpdate();
  }

  destroy() {
    this.svg.remove();
  }
}
