module n3Charts {
  'use strict';

  interface ILineChartScope extends ng.IScope {
    data;
    options;
    styles;
    onDatumOver;
    onDatumOut;
  }

  export class LineChart implements ng.IDirective  {

    public scope = {
      data: '=',
      options: '=',
      styles: '=',
      onDatumOver: '=',
      onDatumOut: '='
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
        ['transitions', Factory.Transition],
        ['x-axis', Factory.Axis, Factory.Axis.SIDE_X],
        ['y-axis', Factory.Axis, Factory.Axis.SIDE_Y],
        ['series-column', Factory.Series.Column],
        ['series-area', Factory.Series.Area],
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

      scope.$watch('onDatumOver', function() {
        eventMgr.on('over.directive', scope.onDatumOver);
      });

      scope.$watch('onDatumOut', function() {
        eventMgr.on('out.directive', scope.onDatumOut);
      });

      // Trigger the destroy event
      scope.$on('$destroy', () => eventMgr.trigger('destroy'));
    };
  }
}
