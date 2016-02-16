/// <reference path='../../typings/angularjs/angular.d.ts' />
/// <reference path='../../typings/jquery/jquery.d.ts' />
/// <reference path='../../typings/d3/d3.d.ts' />

/// <reference path='../svg/_index.ts' />
/// <reference path='../options/_index.ts' />
/// <reference path='../utils/_index.ts' />
/// <reference path='../factories/_index.ts' />

module n3Charts {
  'use strict';

  interface ILineChartScope extends ng.IScope {
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
      var eventMgr = new Utils.EventManager();
      var factoryMgr = new Utils.FactoryManager();

      // Initialize global events
      eventMgr.init(Utils.EventManager.EVENTS);

      // Register all factories
      // Note: we can apply additional arguments to each factory
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
        ['sync-layer', Factory.SyncLayer, scope, attributes, this.$parse],

        // This order is important, otherwise it can mess up with the tooltip
        // (and you don't want to mess up with a tooltip, trust me).
        ['series-area', Factory.Series.Area],
        ['series-column', Factory.Series.Column],
        ['series-line', Factory.Series.Line],
        ['series-dot', Factory.Series.Dot]
      ]);

      // Initialize all factories
      factoryMgr.all().forEach((f) => f.instance.init(f.key, eventMgr, factoryMgr));

      // When options aren't defined at startup (when used inside a directive, for example)
      // we need to wait until they are to create the chart.
      var deferredCreation = scope.options === undefined;

      // Unwrap native options and update the chart
      var data, options;
      var update = () => {
        // Call the update event with a copy of the options
        // and data to avoid infinite digest loop
        options = new Options.Options(angular.copy(scope.options));
        data = new Utils.Data(angular.copy(scope.data));

        if (deferredCreation) {
          deferredCreation = false;
          eventMgr.trigger('create', options);
        }

        // Update the eventMgr itself
        eventMgr.update(data, options);

        // Trigger the update event
        eventMgr.trigger('update', data, options);
      };

      // Trigger the create event
      if (!deferredCreation) {
        eventMgr.trigger('create', new Options.Options(angular.copy(scope.options)));
      }

      // We use $watch because both options and data
      // are objects and not arrays
      scope.$watch('[options, data]', update, true);

      eventMgr.on('legend-click.directive', (series) => {
        var foundSeries = scope.options.series.filter((s) => s.id === series.id)[0];
        foundSeries.visible = series.getToggledVisibility();
        scope.$apply();
      });

      var getDimensions = function():any {
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
      angular.element(this.$window).on(<any>'resize', debouncedApplier);

      // Trigger the destroy event
      scope.$on('$destroy', () => {
        eventMgr.trigger('destroy');
        angular.element(this.$window).off('resize', debouncedApplier);
      });
    };
  }
}
