# Documentation

## Options

**n3-line-chart** provides multiple options to configure your chart, series and axes.

```js
$scope.options = {
  series: [
    ...
  ],
  symbols: [
    ...
  ],
  axes: { ... },
  ...
};
```

### Series

Each series defines a visual element in the chart. They should all have the following form :
```js
series: [{
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
}, { ... }]
```

Name | Type | Default | Description | Mandatory
---- | ---- | ------- | ------------ | --------
`key` | Object or String | - | This can either be a single string (`'value_0'` or something) or a pair of values, for areas, columns, etc (`{y0: 'min_value', y1: 'max_value'}`). | Yes
`label` | String | `""` | What's shown in the tooltip and in the legend for this series. | No
`id` | String | a uuid | A series' identifier, mostly used for visibility toggling. | No
`axis` | String | `'y'` | The axis the series will use to plot its values. Can be either `'y'` or `'y2'`. | Yes
`color` | String | `undefined` | The series's color. Any valid CSS value will work. | No
`interpolation` | Object | `undefined` | Can be something like `{mode: 'cardinal', tension: 0.7}`. More about that [here](https://github.com/mbostock/d3/wiki/SVG-Shapes#line_interpolate) | No
`type` | String or Array | `''` | The series's type(s). Can be any combination of `line`, `area`, `dot`, `column`. | No
`visible` | Boolean | `true` | The series's visibility. Updated on legend click. | No
`defined` | Function | `undefined` | Helps tell the chart where this series is defined or not, regarding its data. More on that [here](https://github.com/mbostock/d3/wiki/SVG-Shapes#line_defined) | No

### Axes
There are currently three axes supported by the directive : `x`, `y` and `y2`. Abscissas (`x`) is mandatory, just because the directive needs to know where to read the abscissas in the data. But there's more !

```js
axes: {
  x: {
    key: 'foo',
    type: 'linear', // or 'date', or 'log'
    ticks: [-10, 0, 10] // can also be a number, or a function
  },
  y: {
    min: -10,
    max: 10,
    padding: {min:3, max: 6},
    ticksShift: {
      y: -5,
      x: 10
    },
    tickFormat: function(value, index) {
      return "Pouet : " + value + " " + index;
    }
  },
  y2: {} // same as y
}
```
Name | Type | Default | Description | Mandatory
---- | ---- | ------- | ------------ | --------
`key`| String | `undefined` | The abscissas key, a property on each datum | Yes
`type` | String | `'linear'` | The axis' type. can be either `'linear'`, `'log'` or `'date'`. | No
`includeZero` | Boolean | `false` | If `true`, the axis will include zero in its extent. | No
`padding` | Object | `{min: 0, max: 0}` | The padding for the axis' extrema (values are expressed in pixels). | No
`ticks` | Array or Number or Function | `undefined` | The axis' ticks. Depending on what is given will either call `tickValues` or `ticks` on the inner d3 axis, or use a home-made axis to display major and minor ticks (see below). | No
`ticksShift` | Object | `{y: 0, x: 0}` | A bit of a hack to allow shifting of the ticks. May be useful if the chart is squeezed in a container and the 0 tick is cropped. Or not. | No. Of course not.
`tickFormat` | Function | `undefined` | Formats the ticks. Takes the value and its index as arguments | No

#### Major and minor ticks
When given a function as the `ticks` attribute, the axis will stop generating its own ticks and start displayign exactly what's returned by the function. This is basically an advanced way of setting the ticks. However, the function must return data as follows :

```js
var myTicksFunction = function(domain) {
  return {
    major: [{label: '00', value: 0}, {label: '01', value: 1}],
    minor: [{label: '.5', value: 0.5}, {label: '.5', value: 1.5}]
  };
};
```

### Symbols

Symbols are a convenient way to add fixed elements to a chart. Their definitions should look like this :
```js
symbols: [{
    type: 'hline',
    value: 100,
    color: 'hsla(5, 100%, 36%, 1)',
    axis: 'y'
  }, { ... }]
```

Name | Type | Default | Description | Mandatory
---- | ---- | ------- | ------------ | --------
`type` | String or Array | `''` | The symbol's type. Can be any of `hline`, `vline`. | Yes
`value` | Number or Date | - | The value (plotted on the relevant axis) where the symbol will be "drawn" | Yes
`axis` | String | `'y'` | The axis the symbol will be plotted against. Can be  `'y'` or `'y2'` for `hline`, and is not taken in account for `vline`. | Yes
`color` | String | `undefined` | The symbol's color. Any valid CSS value will work. | No


### Margin
The `margin` property affects, well, the chart's margins. Useful to optimize space regarding your data. The `margin` object should look like this :
```js
margin: {
  top: 20,
  right: 30,
  bottom: 20,
  left: 10
}
```
Name | Type | Default | Description | Mandatory
---- | ---- | ------- | ------------ | --------
`top` | Number | `0` | The top margin | No
`right` | Number | `40` | The right margin | No
`bottom` | Number | `40` | The bottom margin | No
`left` | Number | `40` | The left margin | No

### TooltipHook
The `tooltipHook` function is a callback that can be used in three ways, regarding its value and what it returns :
 - `undefined` is the default value. The original, unaltered tooltip will show up.
 - a function that returns `false` (or something that casts to `false` like `null`, `undefined`, an empty string... I'm looking at you, JavaScript) will give you a chance to use what's currently hovered but will prevent the tooltip from showing up. The line and the dots will be drawn, though, and masking them can be done in CSS.
 - a function that returns something that doesn't cast to `false` make the chart display what you want in the tooltip. This particular behavior is explained below.

#### Custom tooltip
The function needs to take an array as sole arguments, which contains items. Each of this items contains the row (`{x, y0, y1}`) and the series (as you defined it in the options). The function returned data _must_ possess the following structure :

Name | Type | Description
---- | ---- | -------
`abscissas` | String | The abscissas' label
`rows` | `[{label, value, id, color}]` | These are the dots the chart will draw. All of the properties are strings, the `id` being checked by d3 to process its join.

> The `tooltipHook` function will be called with `undefined` as sole argument when the tooltip is supposed to be hidden (i.e. when the mouse cursor exits the chart).

### Grid
The `grid` object parametrizes how the chart's background grid will be shown. It's not mandatory and should look like this :
```js
grid: {
  x: false,
  y: true
}
```
Name | Type | Default | Description | Mandatory
---- | ---- | ------- | ------------ | --------
`x` | Boolean | `false` | Visibility of the grid's vertical lines | No
`y` | Boolean | `true` | Visibility of the grid's horizontal lines | No

### Pan
The `pan` object parametrizes which of the chart's axes accept(s) panning. It's not mandatory and should look like this :
```js
pan: {
  x: function(newDomain) {
    // conditional stuff here

    // Must return a domain of the form [min, max]
    return newDomain
  },
  x2: true,
  y: false,
  y2: false

}
```
Name | Type | Default | Description | Mandatory
---- | ---- | ------- | ------------ | --------
`x` | Boolean or Function | `false` | Enables/disables panning on the x axis | No
`x2` | Boolean or Function | `false` | Enables/disables panning on the x axis | No
`y` | Boolean or Function | `false` | Enables/disables panning on the y axis | No
`y2` | Boolean or Function | `false` | Enables/disables panning on the y axis | No

### Zoom
The `zoom` object parametrizes which of the chart's axes accept(s) zooming. It's not mandatory and should look like this :
```js
zoom: {
  x: false,
  y: false
}
```
Name | Type | Default | Description | Mandatory
---- | ---- | ------- | ------------ | --------
`x` | Boolean | `false` | Enables/disables zoom on the x axis | No
`y` | Boolean | `false` | Enables/disables zoom on the y axis | No

### Double click
The chart reacts to double clicks by resetting any zooming or panning. This might be undesirable and the `doubleClickEnabled` provides a way to disable this behavior.

```js
doubleClickEnabled: false
```

Name | Type | Default | Description | Mandatory
---- | ---- | ------- | ------------ | --------
`doubleClickEnabled` | Boolean | `true` | Enables/disables the double click handling | No

## Synchronization and callbacks

The directive accepts additional HTML attributes to allow charts' synchronization and callbacks on various events.

Name | Description | Example
---- | ----------- | -------
`on-domains-change` | Method called when an interaction changes the axes' domains. The horizontal and vertical axes' domains are passed under the key `$domains` | `on-domains-change="onDomainsChange($domains)"`
`tooltip-sync-key` | The charts that share the same key and the same root scope will have synchronized tooltips | `tooltip-sync-key="mahKey"`
`domains-sync-key` | The charts that share the same key and the same root scope will have synchronized axes' domains | `domains-sync-key="mahOtherKey"`
`on-click` | Function to call when a data point is clicked | `on-click="mahClickCallback(row, index, series, options)"`

> Please note that heterogeneous keys can't have the same value, i.e. don't pass the same string for two different keys.

## Data

The data format has changed since v1. What now gets passed to the directive as the `data` attribute should be an object (well, *yes*, everything is an object) that defines datasets as properties. Each dataset can then contain an array of arbitrary data point objects. In the series options, one can now specify the datasets with the `dataset` property, as well as the data point value with the `key` property. This is made to allow handling only one data object to the chart, while the series display heterogeneous datasets.

```js
$scope.data = {
  dataset0: [
    {x: 0, y: 2}, {x: 1, y: 3}
  ],
  dataset1: [
    {x: 0, value: 2}, {x: 1, value: 3}
  ],
  ...
};

$scope.options = {
  series: [
    {dataset: "dataset0", key: "y", label: "dataset 0"},
    {dataset: "dataset1", key: "value", label: "dataset 1"}
  ],
  axes: {x: {key: "x"}},
  ...
};
```

Take a look at [the examples](http://n3-charts.github.io/line-chart/#/examples) for more information !

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
