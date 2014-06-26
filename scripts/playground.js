angular.module('playground', ['apojop'])

.directive('series', function() {
  return {
    templateUrl: "../templates/series.html",
    restrict: 'E',
    replace: true,
    scope: {series: '=', fields: '='},
    link: function(scope, element, attrs) {
      scope.types = ["line", "area", "column"];
      scope.axes = ["y", "y2"];

      scope.thickness = 1

      scope.$watch('series', function(v) {
        if (!v || !v.thickness) {
          return;
        }

        scope.thickness = +v.thickness.replace('px', '');
      }, true);

      scope.$watch('thickness', function(v) {
        scope.series.thickness = v + 'px';
      });
    }
  }
})

.controller('PlaygroundCtrl', function($scope) {
  $scope.interpolationModes = [
    "linear",
    "step-before",
    "step-after",
    "basis",
    "basis-open",
    "basis-closed",
    "bundle",
    "cardinal",
    "cardinal-open",
    "cadinal-closed",
    "monotone"
  ];

  $scope.tooltipModes = ["none", "dots", "lines", "both", "scrubber"];
  $scope.fields = ["x", "val_0", "val_1", "val_2", "val_3"];

  $scope.data = [
    {x: 0, val_0: 0, val_1: 0, val_2: 0, val_3: 0},
    {x: 1, val_0: 0.993, val_1: 3.894, val_2: 8.47, val_3: 14.347},
    {x: 2, val_0: 1.947, val_1: 7.174, val_2: 13.981, val_3: 19.991},
    {x: 3, val_0: 2.823, val_1: 9.32, val_2: 14.608, val_3: 13.509},
    {x: 4, val_0: 3.587, val_1: 9.996, val_2: 10.132, val_3: -1.167},
    {x: 5, val_0: 4.207, val_1: 9.093, val_2: 2.117, val_3: -15.136},
    {x: 6, val_0: 4.66, val_1: 6.755, val_2: -6.638, val_3: -19.923},
    {x: 7, val_0: 4.927, val_1: 3.35, val_2: -13.074, val_3: -12.625},
    {x: 8, val_0: 4.998, val_1: -0.584, val_2: -14.942, val_3: 2.331},
    {x: 9, val_0: 4.869, val_1: -4.425, val_2: -11.591, val_3: 15.873},
    {x: 10, val_0: 4.546, val_1: -7.568, val_2: -4.191, val_3: 19.787},
    {x: 11, val_0: 4.042, val_1: -9.516, val_2: 4.673, val_3: 11.698}
  ];
  $scope.options = {
    lineMode: "cardinal",
    tension: 0.7,
    axes: {x: {type: "linear", key: "x"}, y: {type: "linear"}},
    tooltipMode: "dots",
    drawLegend: true,
    drawDots: true,
    series: [
      {
        y: "val_0",
        label: "This",
        type: "area",
        color: "#bcbd22",
        axis: "y",
        thickness: "1px",
        visible: true
      },
      {
        y: "val_1",
        label: "Is",
        type: "column",
        color: "#17becf",
        axis: "y",
        visible: true
      },
      {
        y: "val_2",
        label: "Awesome",
        color: "#9467bd",
        axis: "y",
        type: "line",
        thickness: "1px",
        visible: true
      }
    ]
  };
});
