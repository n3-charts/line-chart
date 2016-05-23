# Getting started

## Installation

### Using npm

You can install **n3-line-chart** by using the `npm` package manager and running following command from the terminal.

`npm install n3-charts`

This will also automatically install the proper versions of D3.js and AngularJS to your `node_modules/` directory.

### Using the CDN
Thanks to [@PeterDaveHello](https://github.com/PeterDaveHello), the library is now accessible through [cdnjs.com](http://cdnjs.com).

The files URLs can be found [there](https://cdnjs.com/libraries/line-chart).

> Please note that installing n3-line-chart via bower is pulling only the source files but not the build files. Please use npm install n3-charts instead!

## Including LineChart

Next, you need to reference *LineChart.js* and *LineChart.css* in your *index.html* file (here, the module has been installed through npm).

```html
<script src="node_modules/n3-charts/build/LineChart.js"></script>
<link rel="stylesheet" href="node_modules/n3-charts/build/LineChart.css">
```

Finally, you need to reference the *n3-line-chart* module in your AngularJS application.

`angular.module('app', ['n3-line-chart'])`

## Creating a Minimal Setup

Here is an example how your HTML file should look like.

```html
<!doctype html>
<html ng-app="app">
  <head>
    <!-- Reference AngularJS and D3.js -->
    <script src="node_modules/angular/angular.min.js"></script>
    <script src="node_modules/d3/d3.min.js"></script>
    <!-- Reference n3-line-chart -->
    <script src="node_modules/n3-charts/build/LineChart.js"></script>
    <link rel="stylesheet" href="node_modules/n3-charts/build/LineChart.css">

    <script type="text/javascript">
      angular.module('app', ['n3-line-chart'])
    </script>
  </head>
  <body>
    <!-- Now you can use the n3-line-chart directive -->
  </body>
</html>
```

## A Simple Example

```html
<!doctype html>
<html ng-app="app">
  <head>
    <!-- Reference AngularJS and D3.js -->
    <script src="node_modules/angular/angular.min.js"></script>
    <script src="node_modules/d3/d3.min.js"></script>
    <!-- Reference n3-line-chart -->
    <script src="node_modules/n3-charts/build/LineChart.js"></script>
    <link rel="stylesheet" href="node_modules/n3-charts/build/LineChart.css">
  </head>
  <body ng-controller='MainCtrl'>
    <div class="my-chart">
      <linechart data="data" options="options"></linechart>
    </div>

    <script type="text/javascript">

      angular
        .module('app', ['n3-line-chart'])

        .controller('MainCtrl', function($scope) {
          $scope.data = {
            dataset0: [
              {x: 0, val_0: 0, val_1: 0, val_2: 0, val_3: 0},
              {x: 1, val_0: 0.993, val_1: 3.894, val_2: 8.47, val_3: 14.347},
              {x: 2, val_0: 1.947, val_1: 7.174, val_2: 13.981, val_3: 19.991},
              {x: 3, val_0: 2.823, val_1: 9.32, val_2: 14.608, val_3: 13.509},
              {x: 4, val_0: 3.587, val_1: 9.996, val_2: 10.132, val_3: -1.167},
              {x: 5, val_0: 4.207, val_1: 9.093, val_2: 2.117, val_3: -15.136},
              {x: 6, val_0: 4.66, val_1: 6.755, val_2: -6.638, val_3: -19.923},
              {x: 7, val_0: 4.927, val_1: 3.35, val_2: -13.074, val_3: -12.625}
            ]
          };

          $scope.options = {
            series: [
              {
                axis: "y",
                dataset: "dataset0",
                key: "val_0",
                label: "An area series",
                color: "#1f77b4",
                type: ['line', 'dot', 'area'],
                id: 'mySeries0'
              }
            ],
            axes: {x: {key: "x"}}
          };
        });
    </script>
  </body>
</html>
```

You can find more examples in the [Examples section](http://n3-charts.github.io/line-chart/#/examples).
