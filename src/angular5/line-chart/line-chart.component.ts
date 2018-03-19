import { Component, OnInit, Input, ElementRef, ViewChild, OnChanges, SimpleChanges, SimpleChange, ViewEncapsulation, OnDestroy } from '@angular/core';

import * as d3 from 'd3';

import * as Utils from '../../utils/_index';
import * as Factory from '../../factories/_index';
import * as Series from '../../factories/series/_index';
import * as Symbols from '../../factories/symbols/_index';
import * as Options from '../../options/_index';
import { AngularJSSyncLayer as SyncLayer } from '../SyncLayer';

@Component({
  selector: 'line-chart',
  template: '',
  styleUrls: ['./line-chart.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '(window:resize)': 'onResize($event)'
  }
})
export class LineChartComponent implements OnChanges, OnInit, OnDestroy      {

  @Input('data') public data: Utils.Data;
  @Input('options') public options: Options.Options;
  @Input('styles') public styles: any;
  @Input('hoveredCoordinates') public hoveredCoordinates: any;

  eventMgr: Utils.EventManager = new Utils.EventManager();
  factoryMgr: Utils.FactoryManager = new Utils.FactoryManager();

  constructor(private element: ElementRef) {
    this.eventMgr.init(Utils.EventManager.EVENTS);

    this.factoryMgr.registerMany([
      ['container', Factory.Container, this.element.nativeElement],
      ['tooltip', Factory.Tooltip, this.element.nativeElement],
      ['legend', Factory.Legend, this.element.nativeElement],
      ['transitions', Factory.Transition],
      ['x-axis', Factory.Axis, Options.AxisOptions.SIDE.X],
      ['x2-axis', Factory.Axis, Options.AxisOptions.SIDE.X2],
      ['y-axis', Factory.Axis, Options.AxisOptions.SIDE.Y],
      ['y2-axis', Factory.Axis, Options.AxisOptions.SIDE.Y2],
      ['grid', Factory.Grid],
      ['pan', Factory.Pan],
      ['zoom', Factory.Zoom],
      // ['sync-layer', SyncLayer, scope, attributes, this.$parse],

      // This order is important, otherwise it can mess up with the tooltip
      // (and you don't want to mess up with a tooltip, trust me).
      ['series-area', Series.Area],
      ['series-column', Series.Column],
      ['series-line', Series.Line],
      ['series-dot', Series.Dot],
      ['symbols-hline', Symbols.HLine],
      ['symbols-vline', Symbols.VLine]
    ]);

    this.factoryMgr.all().forEach((f) => f.instance.init(f.key, this.eventMgr, this.factoryMgr));
  }

  ngOnInit() {
    this.eventMgr.on('legend-click.directive', (series) => {
      var i = this.options.series
        .map(function (s) { return s.id; })
        .indexOf(series.id);
      this.options.series[i].visible = series.getToggledVisibility();
    });

    this.eventMgr.on('pan.directive', () => {
      (<d3.Selection<SVGElement, any, any, any>>this.factoryMgr.get('container').svg).classed('panning', true);
    });
    this.eventMgr.on('pan-end.directive', () => {
      (<d3.Selection<SVGElement, any, any, any>>this.factoryMgr.get('container').svg).classed('panning', false);
    });
  }

  updateData(_data) {
    if (!_data) {
      return;
    }

    this.data.fromJS(_data);
    this.factoryMgr.turnFactoriesOff(['transitions']);
    this.eventMgr.trigger('data-update', this.data, this.options);
    this.factoryMgr.turnFactoriesOn(['transitions']);

    this.eventMgr.trigger('update', this.data, this.options);
    this.eventMgr.trigger('resize', this.element.nativeElement);
  };

  onResize() {
    this.eventMgr.trigger('resize', this.element.nativeElement);
  }

  updateAll() {
    this.eventMgr.update(this.data, this.options);
    this.eventMgr.trigger('update', this.data, this.options);
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options']) {

      this.eventMgr.trigger('create', this.options);

      this.options = new Options.Options(this.options);
      this.data = new Utils.Data(this.data);
      this.updateAll();
    }
    if (changes['data']) {
      this.data = new Utils.Data(this.data);
      this.updateData(changes['data'].currentValue);
    }
  }

  ngOnDestroy(){
    this.eventMgr.trigger('destroy');
  }
}