module.exports = function(config) {
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
    browsers: ['Chrome'],
    singleRun: true
  });
};
