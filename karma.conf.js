// Karma configuration
// Generated on Mon May 06 2013 08:16:19 GMT+0200 (CEST)


// base path, that will be used to resolve files and exclude
basePath = '';


// list of files / patterns to load in the browser
files = [
  JASMINE,
  JASMINE_ADAPTER,
  'components/angular/angular.js',
  'components/angular-mocks/angular-mocks.js',
  'components/d3/d3.js',
  'lib/line-chart.js',
  'test/line-chart.spec.js'
];

preprocessors = {
  'lib/line-chart.js': 'coverage'
};

// list of files to exclude
exclude = [
];


coverageReporter = {
  type : 'text-summary',
  dir : 'coverage/'
}

// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['dots', 'coverage'];


// web server port
port = 9876;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
// browsers = ['PhantomJS'];
browsers = ['PhantomJS']//, 'Firefox']
