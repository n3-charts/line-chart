import * as d3 from 'd3';

import * as Utils from '../utils/_index';
import * as Options from '../options/_index';

import { BaseFactory } from './BaseFactory';
import { Container } from './Container';

export class Grid extends BaseFactory {

  public svg: d3.Selection<any, any, any, any>;
  public xAxis: d3.Axis<number>;
  public yAxis: d3.Axis<number>;

  create() {
    this.svg = this.factoryMgr.get('container').axes
      .insert('g', ':first-child')
        .attr('class', 'grid');

    this.svg.append('g').classed('x-grid', true);
    this.svg.append('g').classed('y-grid', true);

    this.eventMgr.on('resize.' + this.key, this.softUpdate.bind(this));
    this.eventMgr.on('pan.' + this.key, this.softUpdate.bind(this));
    this.eventMgr.on('zoom-end.' + this.key, this.softUpdate.bind(this));
    this.eventMgr.on('outer-world-domain-change.' + this.key, this.softUpdate.bind(this));
  }

  softUpdate() {
    var container = <Container> this.factoryMgr.get('container');
    var dim: Options.Dimensions = container.getDimensions();

    if (this.xAxis) {
      let sel: any = this.svg.select('.x-grid');

      if (this.factoryMgr.get('transitions').isOn()) {
        sel = sel
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'edit'));
      }

      sel.attr('transform', 'translate(0, ' + dim.innerHeight + ')')
         .call(this.xAxis
           .tickSizeInner(-dim.innerHeight)
           .tickSizeOuter(0)
         );
    }

    if (this.yAxis) {
      let sel: any = this.svg.select('.y-grid');

      if (this.factoryMgr.get('transitions').isOn()) {
        sel = sel
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'edit'));
      }

      sel
        .call(this.yAxis
          .tickSizeInner(-dim.innerWidth)
          .tickSizeOuter(0)
        );
    }
  }

  _updateVisibility(options: Options.Options) {
    this.svg.select('.x-grid').style('display', options.grid.x ? null : 'none');
    this.svg.select('.y-grid').style('display', options.grid.y ? null : 'none');
  }

  update(data: Utils.Data, options: Options.Options) {
    var container = <Container> this.factoryMgr.get('container');
    var dim: Options.Dimensions = container.getDimensions();


    if (options.grid.x) {
      this.xAxis = <d3.Axis<number>> this.factoryMgr.get('x-axis').cloneAxis()
        .tickSize(-dim.innerHeight, 0);

      this.svg.select('.x-grid')
        .attr('transform', 'translate(0, ' + dim.innerHeight + ')')
        .transition()
        .call(this.factoryMgr.getBoundFunction('transitions', 'edit'))
        .call(this.xAxis as any);
    }

    if (options.grid.y) {
      this.yAxis = <d3.Axis<number>> this.factoryMgr.get('y-axis').cloneAxis();

      this.svg.select('.y-grid')
        .transition()
        .call(this.factoryMgr.getBoundFunction('transitions', 'edit'))
        .call(this.yAxis
          .tickSizeInner(-dim.innerWidth)
          .tickSizeOuter(0) as any
        );
    }

    this._updateVisibility(options);
  }

  destroy() {
    this.svg.remove();
  }
}
