{
html: '''
  <div class="example-chart">
    <linechart data="data" options="options"></linechart>
  </div>
'''

js: '''
  function($scope) {
    $scope.data = {
      dataset0: [
        {x: 0, val_0: 90, val_1: 110 + 1, val_2: 100 + 2},
        {x: 1, val_0: 90 + 3, val_1: 110 + 4, val_2: 100 + 5},
        {x: 2, val_0: 90 + 6, val_1: 110 + 7, val_2: 100 + 8},
        {x: 3, val_0: 90 + 9, val_1: 110 + 10, val_2: 100 + 11},
        {x: 4, val_0: 90 + 12, val_1: 110 + 13, val_2: 100 + 14},
        {x: 5, val_0: 90 + 15, val_1: 110 + 16, val_2: 100 + 17},
        {x: 6, val_0: 90 + 18, val_1: 110 + 19, val_2: 100 + 20},
        {x: 7, val_0: 90 + 21, val_1: 110 + 22, val_2: 100 + 23}
      ]
    };

    $scope.options = {
      series: [
        {
          axis: "y",
          dataset: "dataset0",
          key: "val_2",
          label: "Average",
          color: "#1f77b4",
          type: "line",
          id: 'mySeries0'
        },
        {
          axis: "y",
          dataset: "dataset0",
          key: {"y0": "val_0", "y1": "val_1"},
          label: "Tolerance",
          color: "grey",
          thickness: "1px",
          type: "area",
          id: 'mySeries1'
        }
      ],
      axes: {x: {key: "x"}}
    };
  }
'''
}
