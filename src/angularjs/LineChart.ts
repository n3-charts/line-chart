'use strict';

import * as d3 from 'd3';
import * as ng from 'angular';

import * as Utils from '../utils/_index';
import * as Factory from '../factories/_index';
import * as Series from '../factories/series/_index';
import * as Symbols from '../factories/symbols/_index';
import * as Options from '../options/_index';
import { AngularJSSyncLayer as SyncLayer } from './SyncLayer';

export interface ILineChartScope extends ng.IScope {
  data;
  options;
  styles;
  hoveredCoordinates;
  elementDimensions;
}

export class LineChart implements ng.IDirective  {

  public scope = {
    data: '=',
    options: '=',
    styles: '=',
    hoveredCoordinates: '='
  };

  public restrict = 'E';
  public replace = true;
  public template = '<div></div>';

  constructor(
    private $window: ng.IWindowService,
    private $parse: ng.IParseService,
    private $timeout: ng.ITimeoutService,
    private $rootScope: ng.IRootScopeService
  ) {}

  link = (scope: ILineChartScope, element: JQuery, attributes: any) => {
    var data: Utils.Data;
    var options: Options.Options;
    var eventMgr = new Utils.EventManager();
    var factoryMgr = new Utils.FactoryManager();

    eventMgr.init(Utils.EventManager.EVENTS);

    factoryMgr.registerMany([
      ['container', Factory.Container, element[0]],
      ['tooltip', Factory.Tooltip, element[0]],
      ['legend', Factory.Legend, element[0]],
      ['transitions', Factory.Transition],
      ['x-axis', Factory.Axis, Options.AxisOptions.SIDE.X],
      ['x2-axis', Factory.Axis, Options.AxisOptions.SIDE.X2],
      ['y-axis', Factory.Axis, Options.AxisOptions.SIDE.Y],
      ['y2-axis', Factory.Axis, Options.AxisOptions.SIDE.Y2],
      ['grid', Factory.Grid],
      ['pan', Factory.Pan],
      ['zoom', Factory.Zoom],
      ['sync-layer', SyncLayer, scope, attributes, this.$parse],

      // This order is important, otherwise it can mess up with the tooltip
      // (and you don't want to mess up with a tooltip, trust me).
      ['series-area', Series.Area],
      ['series-column', Series.Column],
      ['series-line', Series.Line],
      ['series-dot', Series.Dot],
      ['symbols-hline', Symbols.HLine],
      ['symbols-vline', Symbols.VLine]
    ]);

    factoryMgr.all().forEach((f) => f.instance.init(f.key, eventMgr, factoryMgr));

    var deferredCreation = scope.options === undefined;

    var updateAll = () => {
      options = new Options.Options(ng.copy(scope.options));
      data = new Utils.Data(scope.data);

      if (deferredCreation) {
        deferredCreation = false;
        eventMgr.trigger('create', options);
      }

      eventMgr.update(data, options);
      eventMgr.trigger('update', data, options);
    };

    if (!deferredCreation) {
      eventMgr.trigger('create', new Options.Options(ng.copy(scope.options)));
    }

    var updateData = (_data) => {
      if (!_data) {
        return;
      }

      data.fromJS(_data);
      factoryMgr.turnFactoriesOff(['transitions']);
      eventMgr.trigger('data-update', data, options);
      factoryMgr.turnFactoriesOn(['transitions']);

      eventMgr.trigger('update', data, options);
    };

    scope.$watch('options', updateAll, true);
    scope.$watch('data', updateData, true);

    eventMgr.on('legend-click.directive', (series) => {
      var i = options.series
        .map(function(s){ return s.id; })
        .indexOf(series.id);
      scope.options.series[i].visible = series.getToggledVisibility();

      scope.$apply();
    });

    eventMgr.on('pan.directive', () => {
      (<d3.Selection<SVGElement, any, any, any>>factoryMgr.get('container').svg).classed('panning', true);
    });
    eventMgr.on('pan-end.directive', () => {
      (<d3.Selection<SVGElement, any, any, any>>factoryMgr.get('container').svg).classed('panning', false);
    });

    var getDimensions = function(): any {
      if (!element || !element[0]) {
        return {};
      }

      var rect = element[0].parentElement.getBoundingClientRect();
      return {
        height: rect.height,
        width: rect.width,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        top: rect.top
      };
    };

    var debouncedResizeEventEmitter = Utils.FunctionUtils.debounce(() => {
      eventMgr.trigger('resize', element[0].parentElement);
    }, 50);
    scope.$watch(getDimensions, debouncedResizeEventEmitter, true);

    var debouncedApplier = Utils.FunctionUtils.debounce(() => scope.$apply(), 50);
    ng.element(this.$window).on(<any>'resize', debouncedApplier);

    // Trigger the destroy event
    scope.$on('$destroy', () => {
      eventMgr.trigger('destroy');
      ng.element(this.$window).off('resize', debouncedApplier);
    });
  };
}
