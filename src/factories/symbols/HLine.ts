module n3Charts.Factory.Symbols {
  'use strict';

  export class HLine extends Factory.BaseFactory {

    public svg: d3.Selection<any>;
    private options: Options.Options;

    create() {
      this.svg = (<Factory.Container>this.factoryMgr.get('container')).symbols
        .append('g')
          .attr({'class': 'hlines'});

      this.eventMgr.on('resize.' + this.key, this.softUpdate.bind(this));
      this.eventMgr.on('pan.' + this.key, this.softUpdate.bind(this));
      this.eventMgr.on('zoom-end.' + this.key, this.softUpdate.bind(this));
      this.eventMgr.on('outer-world-domain-change.' + this.key, this.softUpdate.bind(this));
    }

    softUpdate() {
      var xAxis = <Factory.Axis>this.factoryMgr.get('x-axis');
      var yAxes = {
        y: <Factory.Axis>this.factoryMgr.get('y-axis'),
        y2: <Factory.Axis>this.factoryMgr.get('y2-axis')
      };

      var hline = this.svg.selectAll('.hline')
        .data(this.options.getSymbolsByType(Options.SymbolOptions.TYPE.HLINE), o => o.id);

      var init = (selection: d3.Selection<Options.SymbolOptions> | d3.Transition<Options.SymbolOptions>) => {
        selection
          .attr('class', 'hline')
          .style({
            'opacity': 0,
            'stroke': o => o.color
          });
      };

      var update = (selection: d3.Selection<Options.SymbolOptions> | d3.Transition<Options.SymbolOptions>) => {
        selection.attr({
          'x1': xAxis.scale(xAxis.getDomain()[0]),
          'x2': xAxis.scale(xAxis.getDomain()[1]),
          'y1': o => yAxes[o.axis].scale(o.value),
          'y2': o => yAxes[o.axis].scale(o.value)
        }).style({
          'opacity': 1
        });
      };

      if (this.factoryMgr.get('transitions').isOn()) {
        hline.enter()
          .append('svg:line')
          .call(init)
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'enter'))
          .call(update);

        hline
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'edit'))
          .call(update);

        hline.exit()
          .transition()
          .call(this.factoryMgr.getBoundFunction('transitions', 'exit'))
          .style('opacity', 0)
          .each('end', function() {
            d3.select(this).remove();
          });
      } else {
        hline.enter()
          .append('svg:line')
          .call(init);

        hline
          .call(update);

        hline.exit()
          .remove();
      }
    }

    update(data:Utils.Data, options:Options.Options) {
      this.options = options;
      this.softUpdate();
    }

    destroy() {
      this.svg.remove();
    }
  }
}
