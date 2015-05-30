/// <reference path='app.ts' />

module n3Charts {
  'use strict';

  interface ILineChartScope extends ng.IScope {
    datasets;
    options;
  }

  export class LineChart implements ng.IDirective  {

    public scope = {
      datasets: '=',
      options: '='
    };

    public restrict = 'E';
    public replace = true;
    public template = '<div></div>';

    constructor(public eventMgr: Utils.EventManager, public factoryMgr: Utils.FactoryManager) {

    }

    link = (scope: ILineChartScope, element: JQuery, attributes: ng.IAttributes) => {

      // Initialize global events
      this.eventMgr.init([
        'create',  // on creation of the chart
        'update',  // on update of the chart
        'destroy', // on destroying the chart
        'hover',   // on hover over a data point or column
        'click',   // on click on a data point or column
        'focus',   // on focus of a data point from a snappy tooltip
        'toggle',  // on toggling series' visibility
      ]);

      // Register all factories
      // Note: we can apply additional arguments to each factory
      this.factoryMgr.register('container', Factory.Container, element[0]);
      this.factoryMgr.register('x-axis', Factory.Axis, 'x');
      this.factoryMgr.register('y-axis', Factory.Axis, 'y');

      // Initialize all factories
      this.factoryMgr.all().map((f) => f.instance.init(f.key, this.eventMgr, this.factoryMgr));

      // Trigger the create event
      this.eventMgr.trigger('create');

      // Trigger the update event
      scope.$watch('options, data', () => {
        // Call the update event with a copy of the options
        // to avoid infinite digest loop
        this.eventMgr.trigger('update', angular.copy(scope.options), attributes);
      }, true);

      // Trigger the destroy event
      scope.$on('$destroy', () => this.eventMgr.trigger('destroy'));
    };

    // This creates a callable directive factory
    // we need this to use TS classes for directives
    // and to inject stuff into the directive
    static factory() {

        // Let's craete a directive factory, that can be instanciated
        // according to the arguments in the constructor
        var directive = (em: Utils.EventManager, fm: Utils.FactoryManager) => new LineChart(em, fm);

        // Let's define the injected stuff
        directive.$inject = ['n3EventManager', 'n3FactoryManager'];

        // Here you go, return the directive
        return directive;
    }
  }
}