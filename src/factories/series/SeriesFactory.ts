import * as d3 from 'd3';

import * as Utils from '../../utils/_index';
import * as Factory from '../../factories/_index';
import { Options, ISeriesOptions } from '../../options/_index';

export class SeriesFactory extends Factory.BaseFactory {

  public svg: d3.Selection<any, any, any, any>;
  public type: string;

  static containerClassSuffix: string = '-data';
  static seriesClassSuffix: string = '-series';

  protected data: Utils.Data;
  protected options: Options;

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

  getAxes(series: ISeriesOptions): {xAxis: Factory.Axis, yAxis: Factory.Axis} {
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

  createContainer(parent: d3.Selection<any, any, any, any>) {
    this.svg = parent
      .append('g')
      .attr('class', this.type + SeriesFactory.containerClassSuffix);
  }

  updateSeriesContainer(series: ISeriesOptions[]) {
    const self = this;
    const select = (that) => d3.select(that) as d3.Selection<any, ISeriesOptions, any, any>;

    const update = (_groups) => {
      _groups
        .each(function(s: ISeriesOptions, i: number) {
          self.updateData(select(this), s, i, series.length);
        })
        .each(function() {
          self.styleSeries(select(this));
        });
    };

    const init = (_groups) => {
      _groups
        .attr('class', (d: ISeriesOptions) => {
          return this.type + SeriesFactory.seriesClassSuffix + ' ' + d.id;
        });
    };

    var groups = this.svg
      .selectAll('.' + this.type + SeriesFactory.seriesClassSuffix)
      .data(series, (d: ISeriesOptions) => d.id);

    groups.call(update);

    groups.enter()
      .append('g')
        .call(init)
      .merge(groups)
        .call(update);

    groups.exit()
      .remove();
  }

  updateData(group: d3.Selection<any, ISeriesOptions, any, any>, series: ISeriesOptions, index: number, numSeries: number) {
    // this needs to be overwritten
  }

  styleSeries(group: d3.Selection<any, ISeriesOptions, any, any>) {
    // this needs to be overwritten
  }
}
