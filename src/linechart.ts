/// <reference path='app.ts' />

module n3Charts {
  'use strict';

  interface ILineChartScope extends ng.IScope {
    data;
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

    constructor(public em: Utils.EventManager, public fm: Utils.FactoryManager) {

    }

    link = (scope: ILineChartScope, element: JQuery, attributes: ng.IAttributes) => {

      // Initialize global events
      this.em.init([
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
      this.fm.register('container', Factory.Container, element[0]);
      this.fm.register('x-axis', Factory.Axis, 'x');
      this.fm.register('y-axis', Factory.Axis, 'y');

      // Initialize all factories
      this.fm.all().map((f) => f.instance.init(f.key, this.em, this.fm));

      // Trigger the create event
      this.em.trigger('create');

      // Trigger the update event
      scope.$watch('options', () => this.em.trigger('update', scope.options), true);
      scope.$watch('data', () => this.em.trigger('update', scope.options), true);

      // Trigger the destroy event
      scope.$on('$destroy', () => this.em.trigger('destroy'));
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