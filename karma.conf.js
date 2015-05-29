module.exports = function(config) {
  var browsers =
  if(process.env.TRAVIS){
    configuration.browsers = ['Chrome_travis_ci'];
  }

  config.set({
    basePath: '.',
    frameworks: ['mocha'],
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      type : 'lcovonly',
      dir : 'coverage/'
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    singleRun: true,
    browsers: ['Chrome'],
    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: ['--no-sandbox']
      }
    }
  });
};
