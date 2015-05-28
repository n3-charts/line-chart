module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai', 'sinon'],
    exclude: [],
    singleRun: true,
    autoWatch: false,
    browsers: ['Firefox'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    captureTimeout: 60000,
  });
};
