angular.module('playground', ['apojop', 'utils', 'directives'])

.controller('PlaygroundCtrl', function($scope, $location, appUtils, $shorten) {
  mixpanel.track("Playground");
  $scope.shareUrl = function() {
    $shorten(escape($location.absUrl())).then(function(data) {
      $scope.url = data;
    });
  };

  $scope.optionsExpanded = true;
  $scope.dataExpanded = true;

  $scope.dataTypes = ['linear', 'logarithmic', 'timed', 'positive'];

  $scope.reset = function() {
    if ($scope.dataTypes.indexOf($scope.dataType) === -1) {
      $scope.dataType = $scope.dataTypes[0];
    }

    $scope.options = {
      lineMode: "cardinal",
      tension: 0.7,
      axes: {x: {type: "linear", key: 'x'}, y: {type: "linear"}},
      tooltipMode: "dots",
      drawLegend: true,
      drawDots: true,
      stacks: [],
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
  };

  if ($location.search().options) {
    try {
      $scope.options = angular.fromJson($location.search().options);
      $scope.dataType = $location.search().dataType;
    } catch (e) {
      console.warn("Unable to parse JSON. Reason :");
      console.warn(e);
    }
  }

  if (!$scope.options || !$scope.dataType || $scope.dataTypes.indexOf($scope.dataType) === -1) {
    console.warn('Falling back to default data and options');
    $scope.reset();
  }

  $scope.$watch('dataType', function(v) {
    $scope.url = null;
    if (!v) {
      return;
    }

    if(appUtils[$scope.dataType + 'Data'] !== undefined) {
      $location.search('dataType', v);
      $scope.data = appUtils[$scope.dataType + 'Data'](30, 4);
    }
  });

  $scope.$watch('options', function(v) {
    $scope.url = null;
    if (!v) {
      return;
    }
    $scope.generatedOptions = angular.copy(v);
    $location.search('options', angular.toJson(angular.copy(v)));
  }, true);
});
