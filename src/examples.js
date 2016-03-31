angular.module('examples', ['n3-line-chart', 'codepen', 'data', 'info'])

.directive('anchorLink', function($location, $anchorScroll) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element[0].addEventListener('click', function() {
        $location.hash(attrs.anchorLink);
        $anchorScroll();
      });
    }
  }
})

.controller('ExamplesCtrl', function($scope, datasets, version) {
  mixpanel.track('Examples', {version: 'v2'});

  version.get().then(function(latestTag) {
    $scope.version = latestTag;
  });

  $scope.examples = [
    {
      label: 'Line series', id: 'line_series', options: {
        margin: {top: 5},
        series: [
          {
            axis: "y",
            dataset: "numerical",
            key: "val_0",
            label: "A line series",
            color: "hsla(88, 48%, 48%, 1)",
            type: ["line"],
            id: 'mySeries0'
          }
        ],
        axes: {x: {key: "x"}}
      }
    },
    {
      label: 'Time series', id: 'time_series', options: {
        margin: {top: 20},
        series: [
          {
            axis: "y",
            dataset: "timed",
            key: "val_0",
            label: "A line series",
            color: "hsla(88, 48%, 48%, 1)",
            type: ["line"],
            id: 'mySeries0'
          }
        ],
        axes: {x: {key: "x", type: 'date'}}
      }
    },
    {
      label: 'Area series', id: 'area_series', options: {
        margin: {top: 5},
        series: [
          {
            axis: "y",
            dataset: "numerical",
            key: "val_0",
            label: "An area series",
            color: "hsla(88, 48%, 48%, 1)",
            type: ["area"],
            id: 'mySeries0'
          }
        ],
        axes: {x: {key: "x"}}
      }
    },
    {
      label: 'Dot series', id: 'dot_series', options: {
        margin: {top: 5},
        series: [
          {
            axis: "y",
            dataset: "numerical",
            key: "val_0",
            label: "A dot series",
            color: "hsla(88, 48%, 48%, 1)",
            type: ["dot"],
            id: 'mySeries0'
          }
        ],
        axes: {x: {key: "x"}}
      }
    },
    {
      label: 'Column series', id: 'column_series', options: {
        margin: {top: 5},
        series: [
          {
            axis: "y",
            dataset: "numerical",
            key: "val_0",
            label: "A column series",
            color: "hsla(88, 48%, 48%, 1)",
            type: ["column"],
            id: 'mySeries0'
          }
        ],
        axes: {x: {key: "x"}}
      }
    },
    {
      label: 'Multi type series', id: 'multi_series', options: {
        margin: {top: 5},
        series: [
          {
            axis: "y",
            dataset: "numerical",
            key: "val_0",
            label: "A multi series",
            color: "hsla(88, 48%, 48%, 1)",
            type: ["dot", 'line', 'area'],
            id: 'mySeries0'
          }
        ],
        axes: {x: {key: "x"}}
      }
    },
    {
      label: 'Logarithmic series', id: 'log_series', options: {
        margin: {top: 5},
        series: [
          {
            axis: "y",
            dataset: "logarithmic",
            key: "val_0",
            label: "A log series",
            color: "hsla(88, 48%, 48%, 1)",
            type: ["dot", 'line', 'area'],
            id: 'mySeries0'
          }
        ],
        axes: {x: {key: "x"}, y: {type: 'log', min: 1}}
      }
    },
    {
      label: 'Interpolation', id: 'interpolation', options: {
        margin: {top: 5},
        series: [
          {
            axis: "y",
            dataset: "noisy",
            key: "val_0",
            label: "Interpolated",
            interpolation: {mode: 'bundle', tension: 0.7},
            color: "hsla(88, 48%, 48%, 1)",
            type: ['line'],
            id: 'mySeries0'
          },
          {
            axis: "y",
            dataset: "noisy",
            key: "val_0",
            label: "Not interpolated",
            color: "hsla(88, 48%, 48%, 1)",
            type: ['line'],
            id: 'mySeries1'
          }
        ],
        axes: {x: {key: "x"}}
      }
    },
    {
      label: 'y0 - y1', id: 'y0_y1_series', options: {
        margin: {top: 5},
        series: [
          {
            axis: "y",
            dataset: "tolerance",
            key: "average",
            label: "Main series",
            color: "hsla(88, 48%, 48%, 1)",
            type: ["dot", 'line'],
            id: 'tolerance'
          },
          {
            axis: "y",
            dataset: "tolerance",
            key: {y0: 'extrema_min', y1: 'extrema_max'},
            label: "Extrema",
            color: "hsla(88, 48%, 48%, 1)",
            type: ['area'],
            id: 'extrema'
          }
        ],
        axes: {x: {key: "x"}, y: {min: 0, max: 40}}
      }
    },
    {
      label: 'Interrupted data', id: 'interrupted_data', options: {
        margin: {top: 5},
        series: [
          {
            axis: "y",
            dataset: "interrupted",
            key: "val_0",
            label: "Continuous",
            color: "hsla(88, 48%, 48%, 1)",
            type: ["dot", 'line', 'area'],
            id: 'mySeries0'
          },
          {
            axis: "y",
            dataset: "interrupted",
            key: "val_3",
            defined: function(value) {
              return value.y1 !== undefined;
            },
            label: "Interrupted",
            color: "hsla(88, 48%, 48%, 1)",
            type: ["dot", 'line', 'area'],
            id: 'mySeries1'
          }
        ],
        axes: {x: {key: "x"}}
      }
    },
  ];

  $scope.data = datasets;
})
;
