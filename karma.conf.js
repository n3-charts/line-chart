module.exports = function(config) {
  var configuration = {
    basePath: '.',
    frameworks: ['mocha'],
    files: [
      'node_modules/expect.js/index.js',
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'node_modules/d3/d3.js',
      'build/utils/*.js',
      'build/factories/*.js',
      'build/linechart.js',
      'build/app.js',
      '.tmp/unit/**/*.js',
      {pattern: 'build/**/*.map', included: false},
      {pattern: '.tmp/**/*.map', included: false}

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
