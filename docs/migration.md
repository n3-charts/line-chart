# Migrating to v2

## Installation

v2 now uses `npm` for distributing the build files; it can be installed via `npm install n3-charts`. This means you should move the dependency to your `package.json` file.

> If for some reason you can only use bower for your frontend dependencies, please let us know via [this issue on Github](https://github.com/n3-charts/line-chart/issues/400)

### Old version v1

```bower install n3-line-chart```

### New version v2

```npm install n3-charts```

## Setup

v2 now uses an extra CSS file for styles. This means, you can now safely override all styles with your own ones.

### Old version v1

```html
<script src="bower_components/build/line-chart.min.js"></script>
```

### New version v2

```html
<script src="node_modules/n3-charts/build/LineChart.js"></script>
<link rel="stylesheet" href="node_modules/n3-charts/build/LineChart.css">
```

## Dataset

The dataset now allows to contain multiple data objects.

### Old version v1

```js
$scope.data = [
  {x: 0, value: 4, otherValue: 14},
  {x: 1, value: 8, otherValue: 1},
  {x: 2, value: 15, otherValue: 11},
  {x: 3, value: 16, otherValue: 147},
  {x: 4, value: 23, otherValue: 87},
  {x: 5, value: 42, otherValue: 45}
];
```

### New version v2

```js
$scope.data = {
  dataset00: [
    {x: 0, value: 4, otherValue: 14},
    {x: 1, value: 8, otherValue: 1},
    {x: 2, value: 15, otherValue: 11},
    {x: 3, value: 16, otherValue: 147},
    {x: 4, value: 23, otherValue: 87},
    {x: 5, value: 42, otherValue: 45}
  ]
};
```

## Options

We renamed some options in v2 for readability and gave you more options on the series.


### Old version v1

```js
$scope.options = {
  axes: {
    x: {key: 'x', ticksFormat: '.2f', type: 'linear', min: 0, max: 10, ticks: 2},
    y: {type: 'linear', min: 0, max: 1, ticks: 5, innerTicks: true, grid: true},
    y2: {type: 'linear', min: 0, max: 1, ticks: [1, 2, 3, 4]}
  },
  margin: {
    left: 100
  },
  series: [
    {y: 'value', color: 'steelblue', thickness: '2px', type: 'area', striped: true, label: 'Pouet'},
    {y: 'otherValue', axis: 'y2', color: 'lightsteelblue', visible: false, drawDots: true, dotSize: 2}
  ],
  lineMode: 'linear',
  tension: 0.7,
  tooltip: {mode: 'scrubber', formatter: function(x, y, series) {return 'pouet';}},
  drawLegend: true,
  drawDots: true,
  hideOverflow: false,
  columnsHGap: 5
}
```

### Removed in version v2

* ~~`columnsHGap`~~ is not needed anymore
* ~~`tooltip: {mode: 'scrubber'}`~~ can now be styled via CSS

### New version v2

* `dataset: 'dataset00'` defines the dataset key form the new data object in series options
* ~~`type: 'area'`~~ and ~~`drawDots`~~ in global options is now `type:['area', 'dot']` in series options
* ~~`lineMode`~~ and ~~`tension`~~ in global options is now `interpolation: {mode: 'cardinal', tension: 0.7}` in series options
* ~~`grid: true`~~ in series options is now `grid: {x: false, y: true}` in global options
* ~~`zoomable: true`~~ in series options is now  `zoom: {x: false, y: true}` (for zooming) and `pan: {x: false, y: true}` (for panning) in global options
* ~~`tooltip: {formatter: function(x, y, series) {return 'pouet';}}`~~ in global options is now `tooltipHook` (see [docs](http://n3-charts.github.io/line-chart/#/docs) or [this example](http://codepen.io/chaosmail/pen/xZgPmp) for more information about its usage)