module n3Charts.Factory.Symbols {
  'use strict';

  export class SymbolFactory extends n3Charts.Factory.BaseFactory {

    public svg: d3.Selection<any>;
    public type: string;

    static containerClassSuffix: string = '-data';
    static symbolsClassSuffix: string = '-symbols';

    protected options: Options.Options;

    create() {
      this.createContainer(this.factoryMgr.get('container').data);

      // Hard update
      this.eventMgr.on('data-update.' + this.type, this.update.bind(this));

      // Soft updates
      this.eventMgr.on('pan.' + this.type, this.softUpdate.bind(this));
      this.eventMgr.on('zoom-end.' + this.type, this.softUpdate.bind(this));
      this.eventMgr.on('outer-world-domain-change.' + this.key, this.softUpdate.bind(this));
      this.eventMgr.on('resize.' + this.type, this.softUpdate.bind(this));
    }

    update(data, options) {
      this.options = options;
      this.softUpdate();
    }

    getAxes(symbol: Options.SymbolOptions): {xAxis: Factory.Axis, yAxis: Factory.Axis} {
      return {
        xAxis: this.factoryMgr.get('x-axis'),
        yAxis: this.factoryMgr.get(symbol.axis + '-axis')
      };
    }

    softUpdate() {
    }

    destroy() {
      this.svg.remove();
    }

    createContainer(parent: d3.Selection<any>) {
      this.svg = parent
        .append('g')
        .attr('class', this.type + SymbolFactory.containerClassSuffix);
    }

    updateContainer(symbols: Options.SymbolOptions[]) {
      var groups = this.svg
        .selectAll('.' + this.type + SymbolFactory.symbolsClassSuffix)
        .data(symbols, (d) => d.id);

      groups.enter()
        .append('g')
        .attr({
          class: (d) => {
            return this.type + SymbolFactory.symbolsClassSuffix + ' ' + d.id;
          }
        });

      this.updateSymbols(groups, symbols);

      groups.exit()
        .remove();
    }

    updateSymbols(groups: d3.Selection<Options.SymbolOptions>, symbols: Options.SymbolOptions[]) {
      var self = this;
      groups.each(function(d, i) {
        // Hmmmm TypeScript...
        var group = <d3.selection.Update<Options.SymbolOptions>>d3.select(this);
        self.updateData(group, d);
      });
    }

    updateData(group: d3.selection.Update<Options.SymbolOptions>, symbol: Options.SymbolOptions) {
      // this needs to be overwritten
    }

    styleSeries(group: d3.Selection<Options.SymbolOptions>) {
      // this needs to be overwritten
    }
  }
}
