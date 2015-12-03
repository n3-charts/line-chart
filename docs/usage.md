 - Include the js and the CSS
 - Import the module

See [some examples](http://n3-charts.github.io/line-chart/v2/#/examples).

## Options

### Series
Each series defines a visual element in the chart. They should all have the following form :
```js
{
  axis: 'y', // only y is supported at this moment
  dataset: 'dataset0',
  key: 'val_0', // can also be something like {y0: 'some_key', y1: 'some_other_key'}
  label: 'An area series',
  interpolation: {mode: 'cardinal', tension: 0.7},
  defined: function() {
   return value.y1 !== undefined; 
  },
  color: "#1f77b4", // or any valid CSS value, really
  type: ['line', 'dot', 'area'], // this, or a string. But this is better.
  id: 'mySeries0'
}
```

Name | Type | Default | Description | Mandatory
---- | ---- | ------- | ------------ | --------
`key` | Object or String | - | This can either be a single string (`'value_0'` or something) or a pair of values, for areas, columns, etc (`{y0: 'min_value', y1: 'max_value'}`). | Yes
`label` | String | `""` | What's shown in the tooltip and in the legend for this series. | No
`id` | String | a uuid | A series' identifier, mostly used for visibility toggling. | No
`axis` | String | `'y'` | The axis the series will use to plot its values. Currently, only `'y'` is supported. | Yes
`color` | String | `undefined` | The series's color. Any valid CSS value will work. | No
`interpolation` | Object | `undefined` | Can be something like `{mode: 'cardinal', tension: 0.7}`. More about that [here](https://github.com/mbostock/d3/wiki/SVG-Shapes#line_interpolate) | No
`type` | String or Array | `''` | The series's type(s). Can be any combination of `line`, `area`, `dot`, `column`. | No
`visibility` | Boolean | `true` | The series's visibility. Updated on legend click. | No
`defined` | Function | `undefined` | Helps tell the chart where this series is defined or not, regarding its data. More on that [here](https://github.com/mbostock/d3/wiki/SVG-Shapes#line_defined) | No

### Axes
There are currently two axes supported by the directive : `x` and `y`. Abscissas (`x`) is mandatory, just because the directive needs to know where to read the abscissas in the data. But there's more !

```js
{
  x: {
    key: 'foo',
    type: 'linear', // or 'date', or 'log'
    ticks: [-10, 0, 10] // can also be a number
  },
  y: {
    min: -10,
    max: 10,
    ticksShift: {
      y: -5,
      x: 10
    },
    tickFormat: function(value, index) {
      return "Pouet : " + value + " " + index;
    }
  }
}
```
Name | Type | Default | Description | Mandatory
---- | ---- | ------- | ------------ | --------
`key`| String | `undefined` | The abscissas key, a property on each datum | Yes
`type` | String | `'linear'` | The axis' type. can be either `'linear'`, `'log'` or `'date'`. | No
`ticks` | Array or Number | `undefined` | The axis' ticks. Depending on what is given will either call `tickValues` or `ticks` on the inner d3 axis. | No
`ticksShift` | Object | `{y: 0, x: 0}` | A bit of a hack to allow shifting of the ticks. May be useful if the chart is squeezed in a container and the 0 tick is cropped. Or not. | No. Of course not.
 `tickFormat` | Function | `undefined` | Formats the ticks. Takes the value and its index as arguments | No

### Margin

### Tooltip

### Grid
#### X
#### Y

### Pan
#### X
#### Y


## Data
### Datasets

## Synchronizing several charts' tooltips

## Full example
```html
<!DOCTYPE HTML>
<html lang="en" ng-app="example">
<head>
  <title>n3-charts</title>
  <link rel="stylesheet" type="text/css" media="screen" href="path/to/LineChart.css">
</head>

<body ng-controller='MyChartCtrl'>
  <div class="my-chart">
    <linechart data="data" options="options"></linechart>
  </div>

  <script src="path/to/angular.js"></script>
  <script src="path/to/d3.min.js"></script>
  <script src="path/to/LineChart.js"></script>

  <script type="text/javascript">

    angular.module('example', ['n3-line-chart'])

    .controller('MyChartCtrl', function($scope) {
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
