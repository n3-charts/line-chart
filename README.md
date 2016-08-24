# n3-line-chart v2 [![Build Status](https://travis-ci.org/n3-charts/line-chart.svg?branch=dev)](https://travis-ci.org/n3-charts/line-chart) [![Coverage Status](https://coveralls.io/repos/n3-charts/line-chart/badge.svg?branch=dev&pouet=tut)](https://coveralls.io/r/n3-charts/line-chart?branch=dev) [![Join the chat at https://gitter.im/n3-charts/line-chart](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/n3-charts/line-chart)

**n3-line-chart** is an easy-to-use JavaScript library for creating beautiful charts in [AngularJS][angular-home] applications and it is built on top of [D3.js][d3-home].

[![n3-charts lead image](https://cloud.githubusercontent.com/assets/2969388/12079874/36579ec8-b249-11e5-8c7f-ee3f724ff886.png)](http://codepen.io/chaosmail/pen/xZgPmp/)

## Resource

* [Documentation][n3-home]
* [Examples][n3-examples]

## Getting started

**Please note:** Currently, **n3-line-chart** works only with D3.js version 3! In D3.js version 4, the API changed and hence breaks compatibility with many 3rd party libaries such as **n3-line-chart**.

You can install **n3-line-chart** by using the `npm` package manager and running following command from the terminal.

`npm install n3-charts`

> Alternatively you can download the [latest release][n3-releases] and place the *line-chart.min.js* wherever you want. Please note, that you need to also download D3.js and AngularJS when installing n3-line-chart manually!

Next, you need to reference *LineChart.js* and *LineChart.css* in your *index.html* file.

```
<script src="node_modules/n3-charts/build/LineChart.js"></script>
<link rel="stylesheet" href="node_modules/n3-charts/build/LineChart.css">
```

Finally, you need to reference the *n3-line-chart* module in your AngularJS application.

```angular.module('app', ['n3-line-chart'])```

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

Now, you can go ahead and check the [examples][n3-examples] and the complete [documentation][n3-home]!

> Looking for the previous version 1? Try using `bower install n3-line-chart#1.1.12`

## What's new in v2?

Good question. Not that we rebuilt this just because we like building things, right ? Seriously though, v2 right now is mostly about solving v1 problems, you know, extendability and maintenance. The chart's directive lifecycle has been thought of from the very beginning, which allows better transitions and full leverage of d3.js capabilities.

Also, we now use something we call... Shoot, we dont have a name for that. Well, imagine a cake. With a bunch of fruits in it. Everything is baked in. Remove a fruit and there's a hole in the cake. No one wants a cake with air in it. That was v1. Now, imagine a pile of pancakes. Delicious, banana flavoured pancakes. Pour some maple syrup on those godly pastries. The syrup goes from one pancake to another, nothing fancy in this. Now if you remove one or two pancake, the syrup probably won't even notice. That's v2. v2's components are organized in layers and talk to each other using two powerful singletons, `eventManager` and `factoryManager`. It makes it super easy to add stuff and extend the directive's features.

### Okay seriously, what's new ?

* **CSS styling** for the entire chart
   Elements naming across the chart is now consistent and easy to override

* **Pure-HTML legend and tooltip** you can pimp as much as you want
   Way easier to implement !

* **D3.js transitions** for data update
   In v1, the entire chart was redrawn each time the data changed. V2 knows better.

* **Better data format**
   The dataset has a new, more versatile format that allow unsynced data to be plotted.

* **Better performance** due to smarter algorithms
   Well, actually what we were doing previously was the dumb way, this one is just the correct one.

* **Better options format**
   Still WIP, though !

## Contribution and Help

You can easily reach us via [Gitter][n3-gitter] for discussions and questions regarding development and usage. If you got stuck, found a bug or want to share some thoughts and improvements please file an [issue][n3-issue].

If you want to contribute, please contact us via [Gitter][n3-gitter] to discuss the changes. Make sure you checkout the [contribution docs][n3-contribution] and developer guidelines before. And don't be shy, we are always glad to help you with your first contributions.

## Authors

**n3-line-chart** v2 is made with love and care by [Christoph Körner](https://github.com/chaosmail) & [Sébastien Fragnaud](https://github.com/lorem--ipsum).

[angular-home]: https://angularjs.org/ "AngularJS"
[d3-home]: https://d3js.org/ "D3.js"
[n3-home]: http://n3-charts.github.io/line-chart "n3-charts Home"
[n3-examples]: http://n3-charts.github.io/line-chart/#/examples "n3-charts Examples"
[n3-releases]: https://github.com/n3-charts/line-chart/releases "n3-charts Releases"
[n3-gitter]: https://gitter.im/n3-charts/line-chart "n3-charts Gitter"
[n3-issue]: https://github.com/n3-charts/line-chart/issues
[n3-contribution]: https://github.com/n3-charts/line-chart/wiki/Contribution
