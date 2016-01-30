module n3Charts.Factory {
  'use strict';

  export class Grid extends Factory.BaseFactory {

    public svg: D3.Selection;
    public xAxis: D3.Svg.Axis;
    public yAxis: D3.Svg.Axis;

    create() {
      this.svg = this.factoryMgr.get('container').axes
        .insert('g', ':first-child')
          .attr('class', 'grid');

      this.svg.append('g').classed('x-grid', true);
      this.svg.append('g').classed('y-grid', true);

      this.eventMgr.on('zoom.' + this.key, this.softUpdate.bind(this));
      this.eventMgr.on('outer-world-zoom.' + this.key, this.softUpdate.bind(this));
    }

    softUpdate() {
      if (this.xAxis) {
        this.svg.select('.x-grid').call(this.xAxis);
      }

      if (this.yAxis) {
        this.svg.select('.y-grid').call(this.yAxis);
      }
    }

    update(data:Utils.Data, options:Options.Options) {
      var container = <Factory.Container> this.factoryMgr.get('container');
      var dim: Options.Dimensions = container.getDimensions();

      if (options.grid.x) {
        this.xAxis = <D3.Svg.Axis> this.factoryMgr.get('x-axis').cloneAxis();

        this.svg.select('.x-grid')
          .transition()
          .call(this.factoryMgr.get('transitions').edit)
          .attr('transform', 'translate(0, ' + dim.innerHeight + ')')
          .call(this.xAxis.tickSize(-dim.innerHeight, 0));
      }

      if (options.grid.y) {
        this.yAxis = <D3.Svg.Axis> this.factoryMgr.get('y-axis').cloneAxis();

        this.svg.select('.y-grid')
          .transition()
          .call(this.factoryMgr.get('transitions').edit)
          .call(this.yAxis.tickSize(-dim.innerWidth, 0));
      }
    }

    destroy() {
      this.svg.remove();
    }
  }
}
