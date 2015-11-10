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

    constructor(private $window: ng.IWindowService, private $parse: ng.IParseService, private $timeout: ng.ITimeoutService) {

    }

    link = (scope: ILineChartScope, element: JQuery, attributes: ng.IAttributes) => {
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
        ['x-axis', Factory.Axis, Utils.AxisOptions.SIDE.X],
        ['y-axis', Factory.Axis, Utils.AxisOptions.SIDE.Y],
        ['y2-axis', Factory.Axis, Utils.AxisOptions.SIDE.Y2],
        ['grid', Factory.Grid],

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
      var update = () => {
        // Call the update event with a copy of the options
        // and data to avoid infinite digest loop
        var options = new Utils.Options(angular.copy(scope.options));
        var data = new Utils.Data(angular.copy(scope.data));

        if (deferredCreation) {
          deferredCreation = false;
          eventMgr.trigger('create', options);
          eventMgr.trigger('resize', element[0].parentElement);
        }

        // Update the eventMgr itself
        eventMgr.update(data, options);

        // Trigger the update event
        eventMgr.trigger('update', data, options);
      };

      // Trigger the create event
      if (!deferredCreation) {
        eventMgr.trigger('create', new Utils.Options(angular.copy(scope.options)));
        eventMgr.trigger('resize', element[0].parentElement);
      }

      // We use $watch because both options and data
      // are objects and not arrays
      scope.$watch('[options, data]', update, true);

      eventMgr.on('legend-click.directive', (series) => {
        var foundSeries = scope.options.series.filter((s) => s.id === series.id)[0];
        foundSeries.visible = series.getToggledVisibility();
        scope.$apply();
      });

      scope.$watch('hoveredCoordinates', (value) => {
        if (value === undefined) {
          return;
        }

        (<Factory.Tooltip>factoryMgr.get('tooltip')).showFromCoordinates(
          value,
          new Utils.Data(angular.copy(scope.data)),
          new Utils.Options(angular.copy(scope.options))
        );
      });

      var setHoveredCoordinates = (value) => {
        // Jesus. Fruitcake. Christ.
        var attrs = <any>attributes;
        var getter = <any>this.$parse(attrs.hoveredCoordinates);
        var setter = getter.assign;
        if (!setter) {
          return;
        }
        var coordinates = factoryMgr.get('container').getCoordinatesFromEvent(event);
        setter(scope.$parent, value);
      };

      eventMgr.on('container-move.directive', (event) => {
        setHoveredCoordinates(factoryMgr.get('container').getCoordinatesFromEvent(event));
        scope.$apply();
      });
      eventMgr.on('container-out.directive', () => {
        setHoveredCoordinates({x: undefined, y: undefined});
        scope.$apply();
      });

      scope.elementDimensions = {};

      var $timeout = this.$timeout;
      var debounce = (callback, interval) => {
        var t = null;
        return (...args) => {
            $timeout.cancel(t);
            t = $timeout(() => callback.apply(this, args), interval);
        };
      };

      var resizeCb = debounce((event: UIEvent) => {
        var rect = element[0].parentElement.getBoundingClientRect();

        scope.elementDimensions.height = rect.height;
        scope.elementDimensions.width = rect.width;
        scope.elementDimensions.left = rect.left;
        scope.elementDimensions.right = rect.right;
        scope.elementDimensions.bottom = rect.bottom;
        scope.elementDimensions.top = rect.top;

        scope.$apply();
      }, 50);

      angular.element(this.$window).on(<any>'resize', resizeCb);

      // Watching the dimensions instead of updating when resize event occurs
      // allows to redraw _only_ when the element itself was actually resized
      scope.$watch('elementDimensions', () => {
        eventMgr.trigger('resize', element[0].parentElement);
        update();
      }, true);

      // Trigger the destroy event
      scope.$on('$destroy', () => {
        eventMgr.trigger('destroy');
        angular.element(this.$window).off();
      });
    };
  }
}
