module n3Charts.Factory.Series {
  'use strict';

  export class SeriesFactory extends n3Charts.Factory.BaseFactory {

    public svg: D3.Selection;
    public type: string;

    static containerClassSuffix: string = '-data';
    static seriesClassSuffix: string = '-series';

    protected data: Utils.Data;
    protected options: Options.Options;

    create() {
      this.createContainer(this.factoryMgr.get('container').data);
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

    softUpdate() {
      var series = this.options.getSeriesByType(this.type).filter((s) => s.visible);
      this.updateSeriesContainer(series);
    }

    destroy() {
      this.svg.remove();
    }

    createContainer(parent: D3.Selection) {
      this.svg = parent
        .append('g')
        .attr('class', this.type + SeriesFactory.containerClassSuffix);
    }

    updateSeriesContainer(series: Options.ISeriesOptions[]) {
      // Create a data join
      var groups = this.svg
        .selectAll('.' + this.type + SeriesFactory.seriesClassSuffix)
        // Use the series id as key for the join
        .data(series, (d: Options.ISeriesOptions) => d.id);

      // Create a new group for every new series
      groups.enter()
        .append('g')
        .attr({
          class: (d: Options.ISeriesOptions) => {
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

    updateSeries(groups: D3.Selection, series: Options.ISeriesOptions[]) {
      // Workaround to retrieve the D3.Selection
      // in the callback function (bound to keyword this)
      var self = this;
      groups.each(function(d: Options.ISeriesOptions, i: number) {
        var group = d3.select(this);
        self.updateData(group, d, i, series.length);
      });
    }

    updateData(group: D3.Selection, series: Options.ISeriesOptions, index: number, numSeries: number) {
      // this needs to be overwritten
    }

    styleSeries(group: D3.Selection) {
      // this needs to be overwritten
    }
  }
}
