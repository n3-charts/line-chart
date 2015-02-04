angular.module('demo', ['ngRoute', 'n3-charts.linechart', 'examples', 'tests', 'playground'])

.config(['$routeProvider', function config($routeProvider) {
  $routeProvider
  .when('/tests', {controller: 'TestsCtrl', templateUrl: 'views/tests.html'})
  .when('/examples', {controller: 'ExamplesCtrl', templateUrl: 'views/examples.html'})
  .when('/playground', {controller: 'PlaygroundCtrl', templateUrl: 'views/playground.html', reloadOnSearch: false})
  .when('/', {controller: 'HomeCtrl', templateUrl: 'views/home.html'})
  .otherwise({redirectTo: '/'});
}])

.controller('HomeCtrl', function($scope, $sce) {
  mixpanel.track("Home");
  $scope.releases = [
    {
      tag: '1.1.6',
      name: 'ludicrous-limbo',
      lines: [
        'Revamped the way axis are shown/adjusted to the view ([#177]).'
      ]
    },
    {
      tag: '1.1.4',
      name: 'kou-kouye',
      lines: [
        'Added <code>width</code> and <code>height</code> as HTML attributes([#107])'
      ]
    },
    {
      tag: '1.1.3',
      name: 'jealous-jeopardy',
      lines: [
        'Added the <code>ticks</code> option for axes ([#121])',
        'Chart now updates when a series is shown/hidden ([#125])',
        'People can now pimp dem charts with the new dotSize option yo ([#129])',
        'Added <code>min</code> and <code>max</code> option for axes'
      ]
    },
    {
      tag: '1.1.2',
      name: 'immediate-idiocracy',
      lines: [
        'Stacked series FTW',
        'Scrubber tooltip mode is now the default mode',
        '<code>drawDots</code> is now a per-series options (thanks <a href="https://github.com/andygray"><i class="fa fa-github"></i> andygray</a>)',
        '<code>columnsHGap</code> options allows to pimp a little bit dem columns yo.',
        'Fixed a bunch of issues ([#64], [#85], [#111])',
        'A better playground !'
      ]
    },
    {
      tag: '1.1.1',
      name: 'helicoidal-hamster',
      lines: [
        'Scrubber tooltip mode is now prod-ready'
      ]
    },
    {
      tag: '1.0.9',
      name: 'gorgeous-glitter',
      lines: [
        'Added dashed mode to line and area series (thanks <a href="https://github.com/andygray"><i class="fa fa-github"></i> andygray</a>)'
      ]
    },
    {
      tag: '1.0.8', name: 'edible-elephant',
      lines: [
        'Fixed update issue ([#86])',
        'Added super cool new tooltip mode (called \'scrubber\')'
      ]
    },
    {
      tag: '1.0.7', name: 'flegmatic-fiction',
      lines: [
        'Min and max can be forced on vertical axes',
        'Tooltip is more configurable (thanks <a href="https://github.com/domrein"><i class="fa fa-github"></i>domrein</a>)',
        'Series can be hidden at startup',
        'Options object is now updated when showing/hiding a series through the chart\'s legend',
        'Bunch of fixes (thanks for the clear bug reports guys !)'
      ]
    },
    {
      tag: '1.0.6', name: 'extreme-estimation',
      lines: [
        'Bower package renamed to <code>n3-line-chart</code>',
        'Module can now be injected as <code>n3-line-chart</code>'
      ]
    },
    {
      tag: '1.0.5', name: 'decisive-diary',
      lines: [
        'Code is now written in CoffeeScript',
        'Tests now use the Mocha framework'
      ]
    },
    {
      tag: '1.0.4', name: 'conceptual-cork',
      lines: [
        'Configurable line thickness',
        'Label function available for vertical axes too',
        'Optional color setting for axes',
        'Legend icons are now clipped',
        'Demo page now uses <a href="http://lorem--ipsum.github.io/apojop/#/">APOJOP</a> for pretty printing.',
        'Upgraded to latest AngularJS (1.2.15) and D3 (3.4.3)',
        'Minor bug fixes ([#54], [#55])'
      ]
    },
    {
      tag: '1.0.3', name: 'adiabatic-acrobat',
      lines: [
        'Stripes for areas',
        'A better legend (with distinct symbols for series types)',
        'A better thumbnail mode (no dots, less margins, more sparklines-like result)'
      ]
    },
    {
      tag: '1.0.2', name: 'sassy-saucer',
      lines: [
        'Thumbnail mode'
      ]
    },
    {
      tag: '1.0.0-beta', name: 'mighty-mole',
      lines: [
        'Configurable abscissas tick labels',
        'Configurable abscissas key',
        'Logarithmic vertical axes',
        'Automatic colors assignment if none found',
        'Zero-height columns trigger tooltips anyway'
      ]
    },
    {
      tag: '0.2', name: '',
      lines: [
        'Date values for abscissas',
        'Line series',
        'Area series',
        'Column series',
        'Second vertical axis (on the right)',
        'Interpolation for line and area series',
        'Interactive legend'
      ]
    }
  ];
  $scope.releases.forEach(function(r) {
    r.lines = r.lines.map(function(line) {
      return $sce.trustAsHtml(line);
    })
  });

  $scope.data = [
    {x: 0, y: 0, other_y: 0, val_2: 0, val_3: 0},
    {x: 1, y: 0.993, other_y: 3.894, val_2: 8.47, val_3: 14.347},
    {x: 2, y: 1.947, other_y: 7.174, val_2: 13.981, val_3: 19.991},
    {x: 3, y: 2.823, other_y: 9.32, val_2: 14.608, val_3: 13.509},
    {x: 4, y: 3.587, other_y: 9.996, val_2: 10.132, val_3: -1.167},
    {x: 5, y: 4.207, other_y: 9.093, val_2: 2.117, val_3: -15.136},
    {x: 6, y: 4.66, other_y: 6.755, val_2: -6.638, val_3: -19.923},
    {x: 7, y: 4.927, other_y: 3.35, val_2: -13.074, val_3: -12.625},
    {x: 8, y: 4.998, other_y: -0.584, val_2: -14.942, val_3: 2.331},
    {x: 9, y: 4.869, other_y: -4.425, val_2: -11.591, val_3: 15.873},
    {x: 10, y: 4.546, other_y: -7.568, val_2: -4.191, val_3: 19.787},
    {x: 11, y: 4.042, other_y: -9.516, val_2: 4.673, val_3: 11.698},
    {x: 12, y: 3.377, other_y: -9.962, val_2: 11.905, val_3: -3.487},
    {x: 13, y: 2.578, other_y: -8.835, val_2: 14.978, val_3: -16.557}
  ];

  $scope.options = {axes: {y2: {min: -15, max: 15}},series: [
    {y: 'val_2', label: 'One', type: 'area', striped: true},
    {y: 'y', type: 'area', striped: true, label: 'Two'},
    {y: 'other_y', type: 'area', label: 'Three', striped: true, axis: 'y2'}
  ], lineMode: 'cardinal', tooltip: {mode: 'scrubber'}};

})

;
