module.exports = function(config) {
  var configuration = {
    basePath: '.',
    frameworks: ['mocha'],
    files: [
      'node_modules/expect.js/index.js',
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      {pattern: 'src/**/*.ts', included: false},
      {pattern: 'test/**/*.ts', included: false},
      'node_modules/d3/d3.min.js',
      'build/LineChart.js',
      '.tmp/unit/**/*.js'
    ],
    reporters: ['dots', 'coverage'],
    coverageReporter: {
      type : 'lcovonly',
      dir : 'test/coverage/'
    },
    preprocessors: {
      'build/LineChart.js':['coverage']
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_WARN,
    autoWatch: false,
    singleRun: false,
    browsers: ['Chrome'],
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    }
  };

  if(process.env.TRAVIS){
    configuration.browsers = ['Chrome_travis_ci'];
  }

  config.set(configuration);
};
