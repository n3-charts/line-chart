/// <reference path='app.ts' />
var n3Charts;
(function (n3Charts) {
    'use strict';
    var LineChart = (function () {
        function LineChart(em, fm) {
            var _this = this;
            this.em = em;
            this.fm = fm;
            this.scope = {
                datasets: '=',
                options: '='
            };
            this.restrict = 'E';
            this.replace = true;
            this.template = '<div></div>';
            this.link = function (scope, element, attributes) {
                // Initialize global events
                _this.em.init([
                    'create',
                    'update',
                    'destroy',
                    'hover',
                    'click',
                    'focus',
                    'toggle',
                ]);
                // Register all factories
                // Note: we can apply additional arguments to each factory
                _this.fm.register('container', n3Charts.Factory.Container, element[0]);
                _this.fm.register('x-axis', n3Charts.Factory.Axis, 'x');
                _this.fm.register('y-axis', n3Charts.Factory.Axis, 'y');
                // Initialize all factories
                _this.fm.all().map(function (f) { return f.instance.init(f.key, _this.em, _this.fm); });
                // Trigger the create event
                _this.em.trigger('create');
                // Trigger the update event
                scope.$watch('options', function () { return _this.em.trigger('update', scope.options); }, true);
                scope.$watch('data', function () { return _this.em.trigger('update', scope.options); }, true);
                // Trigger the destroy event
                scope.$on('$destroy', function () { return _this.em.trigger('destroy'); });
            };
        }
        // This creates a callable directive factory
        // we need this to use TS classes for directives
        // and to inject stuff into the directive
        LineChart.factory = function () {
            // Let's craete a directive factory, that can be instanciated
            // according to the arguments in the constructor
            var directive = function (em, fm) { return new LineChart(em, fm); };
            // Let's define the injected stuff
            directive.$inject = ['n3EventManager', 'n3FactoryManager'];
            // Here you go, return the directive
            return directive;
        };
        return LineChart;
    })();
    n3Charts.LineChart = LineChart;
})(n3Charts || (n3Charts = {}));
//# sourceMappingURL=linechart.js.map