angular.module('playground', ['apojop', 'utils', 'directives'])

.controller('PlaygroundCtrl', function($scope, $location, appUtils) {
  if ($location.search().options) {
    try {
      $scope.options = angular.fromJson($location.search().options);
      $scope.dataType = $location.search().dataType;
    } catch (e) {
      console.warn("Unable to parse JSON. Reason :");
      console.warn(e);
    }
  }

  if (!$scope.options || !$scope.dataType || ['linear', 'log', 'timed'].indexOf($scope.dataType) === -1) {
    console.warn('Falling back to default data and options');
    $scope.dataType = 'linear';
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
  }

  $scope.data = appUtils[$scope.dataType.slice('0, 3') + 'Data'](30, 4);

  $scope.$watch('options+dataType', function() {
    $location.search('options', angular.toJson(angular.copy($scope.options)));
    $location.search('dataType', $scope.dataType);
  }, true);
});
