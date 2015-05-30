module.exports = function(config) {
  var configuration = {
    basePath: '.',
    frameworks: ['mocha'],
    files: [
      'node_modules/expect.js/index.js',
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/d3/d3.js',
      '.tmp/src/utils/*.js',
      '.tmp/src/factories/*.js',
      '.tmp/src/LineChart.js',
      '.tmp/src/app.js',
      '.tmp/test/unit/**/*.js',
      {pattern: '.tmp/**/*.map', included: false},
      {pattern: 'src/**/*.ts', included: false},
      {pattern: 'test/**/*.ts', included: false}
    ],
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      type : 'lcovonly',
      dir : 'coverage/'
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
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
