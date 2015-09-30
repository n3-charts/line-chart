module n3Charts {
  'use strict';

  interface ILineChartScope extends ng.IScope {
    data;
    options;
    styles;
    onDatumEnter;
    onDatumOver;
    onDatumMove;
    onDatumLeave;
  }

  export class LineChart implements ng.IDirective  {

    public scope = {
      data: '=',
      options: '=',
      styles: '=',
      onDatumEnter: '=',
      onDatumOver: '=',
      onDatumMove: '=',
      onDatumLeave: '='
    };

    public restrict = 'E';
    public replace = true;
    public template = '<div></div>';

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

        // This order is important, otherwise it can mess up with the tooltip
        // (and you don't want to mess up with a tooltip, trust me).
        ['series-area', Factory.Series.Area],
        ['series-column', Factory.Series.Column],
        ['series-line', Factory.Series.Line],
        ['series-dot', Factory.Series.Dot]
      ]);

      // Initialize all factories
      factoryMgr.all().forEach((f) => f.instance.init(f.key, eventMgr, factoryMgr));

      // Trigger the create event
      eventMgr.trigger('create');

      // We use $watch because both options and data
      // are objects and not arrays
      scope.$watch('[options, data]', () => {
        // Call the update event with a copy of the options
        // and data to avoid infinite digest loop
        var options = new Utils.Options(angular.copy(scope.options));
        var data = new Utils.Data(angular.copy(scope.data));

        // Trigger the update event
        eventMgr.trigger('update', data, options);
      }, true);

      scope.$watch('onDatumEnter', function() {
          eventMgr.on('enter.directive', scope.onDatumEnter);
      });

      scope.$watch('onDatumOver', function() {
        eventMgr.on('over.directive', scope.onDatumOver);
      });

      scope.$watch('onDatumMove', function() {
          eventMgr.on('move.directive', scope.onDatumMove);
      });

      scope.$watch('onDatumLeave', function() {
        eventMgr.on('leave.directive', scope.onDatumLeave);
      });

      eventMgr.on('legend-click.directive', (series) => {
        var foundSeries = scope.options.series.filter((s) => s.id === series.id)[0];
        foundSeries.visible = series.getToggledVisibility();
        scope.$apply();
      });

      // Trigger the destroy event
      scope.$on('$destroy', () => eventMgr.trigger('destroy'));
    };
  }
}
