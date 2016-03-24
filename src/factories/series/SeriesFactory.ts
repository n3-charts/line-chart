module n3Charts.Factory.Series {
  'use strict';

  export class SeriesFactory extends n3Charts.Factory.BaseFactory {

    public svg: d3.Selection<any>;
    public type: string;

    static containerClassSuffix: string = '-data';
    static seriesClassSuffix: string = '-series';

    protected data: Utils.Data;
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
      this.data = data;
      this.options = options;
      this.softUpdate();
    }

    getAxes(series: Options.ISeriesOptions): {xAxis: Factory.Axis, yAxis: Factory.Axis} {
      return {
        xAxis: this.factoryMgr.get('x-axis'),
        yAxis: this.factoryMgr.get(series.axis + '-axis')
      };
    }

    softUpdate() {
      var series = this.options.getSeriesByType(this.type).filter((s) => s.visible);
      this.updateSeriesContainer(series);
    }

    destroy() {
      this.svg.remove();
    }

    createContainer(parent: d3.Selection<any>) {
      this.svg = parent
        .append('g')
        .attr('class', this.type + SeriesFactory.containerClassSuffix);
    }

    updateSeriesContainer(series: Options.ISeriesOptions[]) {
      // Create a data join
      var groups = this.svg
        .selectAll('.' + this.type + SeriesFactory.seriesClassSuffix)
        // Use the series id as key for the join
        .data(series, (d) => d.id);

      // Create a new group for every new series
      groups.enter()
        .append('g')
        .attr({
          class: (d) => {
            return this.type + SeriesFactory.seriesClassSuffix + ' ' + d.id;
          }
        });

      // Update all existing series groups
      this.styleSeries(groups);
      this.updateSeries(groups, series);

      // Delete unused series groups
      groups.exit()
        .remove();
    }

    updateSeries(groups: d3.Selection<Options.ISeriesOptions>, series: Options.ISeriesOptions[]) {
      // Workaround to retrieve the D3.Selection
      // in the callback function (bound to keyword this)
      var self = this;
      groups.each(function(d, i) {

        // Hmmmm TypeScript...
        var group = <d3.selection.Update<Options.ISeriesOptions>>d3.select(this);
        self.updateData(group, d, i, series.length);
      });
    }

    updateData(group: d3.selection.Update<Options.ISeriesOptions>, series: Options.ISeriesOptions, index: number, numSeries: number) {
      // this needs to be overwritten
    }

    styleSeries(group: d3.Selection<Options.ISeriesOptions>) {
      // this needs to be overwritten
    }
  }
}
