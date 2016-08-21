module n3Charts.Factory {
  'use strict';

  export class Grid extends Factory.BaseFactory {

    public svg: d3.Selection<any>;
    public xAxis: d3.svg.Axis;
    public yAxis: d3.svg.Axis;

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
      var container = <Factory.Container> this.factoryMgr.get('container');
      var dim: Options.Dimensions = container.getDimensions();

      if (this.xAxis) {
        let sel:any = this.svg.select('.x-grid');

        if (this.factoryMgr.get('transitions').isOn()) {
          sel = sel
            .transition()
            .call(this.factoryMgr.getBoundFunction('transitions', 'edit'));
        }

        sel.attr('transform', 'translate(0, ' + dim.innerHeight + ')')
           .call(this.xAxis.tickSize(-dim.innerHeight, 0));
      }

      if (this.yAxis) {
        let sel: any = this.svg.select('.y-grid');

        if (this.factoryMgr.get('transitions').isOn()) {
          sel = sel
            .transition()
            .call(this.factoryMgr.getBoundFunction('transitions', 'edit'));
        }

        sel
          .call(this.yAxis.tickSize(-dim.innerWidth, 0));
      }
    }

    _updateVisibility(options:Options.Options) {
      this.svg.select('.x-grid').style('display', options.grid.x ? null : 'none');
      this.svg.select('.y-grid').style('display', options.grid.y ? null : 'none');
    }

    update(data:Utils.Data, options:Options.Options) {
      var container = <Factory.Container> this.factoryMgr.get('container');
      var dim: Options.Dimensions = container.getDimensions();

      if (options.grid.x) {
        this.xAxis = <d3.svg.Axis> this.factoryMgr.get('x-axis').cloneAxis()
          .tickSize(-dim.innerHeight, 0);

        this.svg.select('.x-grid')
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'edit'))
          .attr('transform', 'translate(0, ' + dim.innerHeight + ')')
          .call(this.xAxis);
      }

      if (options.grid.y) {
        this.yAxis = <d3.svg.Axis> this.factoryMgr.get('y-axis').cloneAxis();

        this.svg.select('.y-grid')
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'edit'))
          .call(this.yAxis.tickSize(-dim.innerWidth, 0));
      }

      this._updateVisibility(options);
    }

    destroy() {
      this.svg.remove();
    }
  }
}
