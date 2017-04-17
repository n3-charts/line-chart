// package metadata file for Meteor.js
var packageName = 'pacozaa:angularjs-n3-line-chart';
var where = 'client'; // where to install: 'client' or 'server'. For both, pass nothing.
var version = '1.0.1';
var summary = 'Awesome charts for AngularJS';
var gitLink = 'https://github.com/pacozaa/line-chart';
var documentationFile = 'README.md';

// Meta-data
Package.describe({
  name: packageName,
  version: version,
  summary: summary,
  git: gitLink,
  documentation: documentationFile
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.0.1');// Meteor versions

  // api.use('angularjs:angular@1.2.3', 'client'); // Dependencies
  api.use('d3js:d3@3.5.1','client');
  api.use('momentjs:moment@2.10.6','client');

  api.addFiles('build/line-chart.js', 'client'); // Files in use
});
