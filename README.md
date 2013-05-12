# n3-charts.line-chart [![Build Status](https://travis-ci.org/angular-d3/line-chart.png?branch=master)](https://travis-ci.org/angular-d3/line-chart)

A line chart implementation for [AngularJS](http://angularjs.org/) applications. It makes an extensive use of the wonderful [D3.js](http://d3js.org/) library.

And here is a [demo](http://angular-d3.github.io/line-chart).

### How to install
 + Copy `line-chart.js` and `line-chart.css` wherever you want
 + Reference them in your index.html file
 + Reference the module in your app file :
     angular.module('myApp', [
      'n3-charts.linechart'
    ])

### How to use
A line chart is called using this syntax :

```html
<linechart data="data" options="options"></linechart>
```

The line chart directives needs two attributes : `data` and `options`. If one is missing, nothing happens.

#### Data
Your data should look like this :

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
> **Note :** only `x` is supported as an abscissas key.

#### Options
Options must be an object with a series array. It should look like this :

```js
$scope.options = {
  series: [
    {y: 'value', color: 'steelblue'},
    {y: 'otherValue', axis: 'y2', color: 'lightsteelblue'}
  ],
  showArea: true,
  lineMode: 'linear'
}
```
##### Series definition
The `series` key must be an array which contains objects with the following properties :
 
+ `y` : mandatory, defines which property on each data row will be used as ordinate value.
+ `color` : mandatory, any valid HTML color.
+ `axis` : optional, can be either 'y' (default, for left) or 'y2' (for right). Defines which vertical axis should be used for this series. If no right axis is needed, none will be displayed.

##### Optional stuff
Additionally, you can set `showArea` to `true` (default is false), and/or `lineMode` to a value between these :

+ linear *(default)*
+ step-before
+ step-after
+ basis
+ basis-open
+ basis-closed
+ bundle
+ cardinal
+ cardinal-open
+ cadinal-closed
+ monotone

> For more information about interpolation, please consult the [D3.js documentation about that][1].

### Testing
AngularJS is designed to be testable, and so is this project.

This will install karma (and other stuff, I guess)

```sh
$ npm install
```

And this will run the awesome karma testrunner. In the also awesome PhantomJS headless browser. There is so much awesomeness in here.

```sh
$ karma start karma-conf.js
```


  [1]: https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-line_interpolate