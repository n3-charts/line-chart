angular.module('examples', ['n3-line-chart', 'codepen', 'data'])

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

.controller('ExamplesCtrl', function($scope, datasets) {
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
            dataset: "numerical",
            key: "val_0",
            label: "An interpolated series",
            interpolation: {mode: 'cardinal', tension: 0.7},
            color: "hsla(88, 48%, 48%, 1)",
            type: ["dot", 'line', 'area'],
            id: 'mySeries0'
          },
          {
            axis: "y",
            dataset: "numerical",
            key: "val_1",
            label: "A non interpolated series",
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
