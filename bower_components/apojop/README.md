APOJOP [![Build Status](https://travis-ci.org/lorem--ipsum/apojop.png?branch=master)](https://travis-ci.org/lorem--ipsum/apojop)
=============

Awesome Plain Old JavaScript Objects Printer for AngularJS. A demo is available [here](http://lorem--ipsum.github.io/apojop/).

### What's that ? ###
It's a filter that you'll use just like the `json` filter from AngularJS core package.

### What does it do ? ###
It prints in the best way the object you give it. For instance, take the following array :
```js
var object = [
  {
    a_string: 'ipsum',
    a_date: new Date(),
    a_boolean: true,
    an_obj: {ping: 'pong', a_closure: function(a, b) {return (a && b) ? a + b : NaN;}},
    an_array: ['lorem', 'ispum', 'dolor', 'sit', 'amet', 1337]
  },
  {
    a_string: 'hello',
    a_date: new Date(),
    a_boolean: true,
    an_obj: {ping: 'is', a_closure: function(a, b) {return (a && b) ? a + b : NaN;}},
    an_array: ['it', 'tea', 'you\'re', 'looking', 'for', 1337]
  }
]
```

It is well formatted, right ? And why is that ? It's because, by hand, the developer managed to unfold enough the main array so that the items' content is clearly visible, but he didn't unfold the inner objects properties, simply because they're small enough to be displayed onthe same line. Well, that's exactly what APOJOP does. You tell it how many columns it must not overlap, or how many levels it should crawl, and it does the rest. Magic.

### How to use ###
Include the `apojop.min.js` somewhere in your project, add the module to your app's dependencies and bazinga : the filter is available.

In your HTML file, just add the following line :
```html
<pre ng-bind-html="my_object|pretty:80:'columns'"></pre>
```

or, for a depth based prettifying :
```html
<pre ng-bind-html="my_object|pretty:2:'levels'"></pre>
```

### Tests ###
Apojop is 100% tested thanks to Karma, PhantomJS, and Jasmine.
