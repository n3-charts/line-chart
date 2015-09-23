module n3Charts.Utils {
  'use strict';

  export class SeriesFactory extends BaseFactory {

    public svg: D3.Selection;
    public type: string;

    static containerClassSuffix: string = '-data';
    static seriesClassSuffix: string = '-series';

    protected data: Data;
    protected options: Options;

    update(data, options) {
      this.data = data;
      this.options = options;

      var series = options.getSeriesByType(this.type).filter((s) => s.visible);

      this.updateSeriesContainer(series);
    }

    create() {
      this.createContainer(this.factoryMgr.get('container').data);
    }

    destroy() {
      this.svg.remove();
    }

    createContainer(parent: D3.Selection) {
      this.svg = parent
        .append('g')
        .attr('class', this.type + SeriesFactory.containerClassSuffix);
    }

    updateSeriesContainer(series: Series[]) {

      // Create a data join
      var groups = this.svg
        .selectAll('.' + this.type + SeriesFactory.seriesClassSuffix)
        // Use the series id as key for the join
        .data(series, (d: Series) => d.id);

      // Create a new group for every new series
      groups.enter()
        .append('g')
        .attr({
          class: (d: Series) => {
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

    updateSeries(groups: D3.Selection, series: Series[]) {
      // Workaround to retrieve the D3.Selection
      // in the callback function (bound to keyword this)
      var self = this;
      groups.each(function(d: Series, i: number) {
        var group = d3.select(this);
        self.updateData(group, d, i, series.length);
      });
    }

    updateData(group: D3.Selection, series: Utils.Series, index: number, numSeries: number) {
      // we need to overwrite this
    }

    styleSeries(group: D3.Selection) {
      // we need to override this
    }
  }
}