line-chart [![Build Status](https://travis-ci.org/angular-d3/line-chart.png?branch=master)](https://travis-ci.org/angular-d3/line-chart)
==========

A line chart implementation for [AngularJS](http://angularjs.org/) applications. It makes an extensive use of the wonderful [D3.js](http://d3js.org/) library.

See a demo [here](http://angular-d3.github.io/line-chart/#/default).

# How to install
 + Copy `line-chart.js` and `line-chart.css` wherever you want
 + Reference them in your index.html file
 + Reference the module in your app file :
     angular.module('myApp', [
      'n3-charts.linechart'
    ])

# How to use
A line chart is called using this syntax :

```html
<linechart data="data" options="options"></linechart>
```

The line chart directives takes two attributes : `data` and `options`.

## Data
Data must be an array, it should look like this :

```js
$scope.data = [
  {x: 0, value: 4},
  {x: 1, value: 8},
  {x: 2, value: 15},
  {x: 3, value: 16},
  {x: 4, value: 23},
  {x: 5, value: 42}
];
```

Currently only `x` is supported as an abscissas key. See Options for the ordinates keys.

## Options
Options must be an object with a series array. It should look like this :

```js
$scope.options = {
  series: [
    {y: 'value', color: 'steelblue'}
  ],
  showArea:true/false,
  lineMode:'linear'
}
```

### LineModes:
['linear','step-before','step-after','basis','basis-open','basis-closed','bundle','cardinal','cardinal-open','cadinal-closed','monotone']

## Testing
AngularJS is designed to be testable, and so is this project. Install karma and run this from a terminal (sorry for non-linux users) :

```sh
$ karma start karma-conf.js
```
